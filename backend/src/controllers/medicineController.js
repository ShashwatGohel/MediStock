import Medicine from "../models/Medicine.js";
import { medicineCatalog } from "../config/medicineCatalog.js";
import { calculateDistance } from "../utils/locationHelper.js";
import * as XLSX from "xlsx";

// Helper to parse dates in various formats including Excel serials, DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
const parseDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) {
        return isNaN(dateVal.getTime()) ? null : dateVal;
    }

    // Handle Excel Serial Numbers (Numbers)
    if (typeof dateVal === 'number') {
        // Excel base date is Dec 30, 1899. 
        return new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    }

    const dateStr = String(dateVal).trim();
    if (!dateStr) return null;

    // Check for DD-MM-YYYY, DD/MM/YYYY, or DD.MM.YYYY format
    const commonFormat = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/;
    const match = dateStr.match(commonFormat);

    if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        let year = parseInt(match[3]);

        // Handle 2-digit years
        if (year < 100) {
            year += (year > 50 ? 1900 : 2000);
        }

        const date = new Date(year, month, day);
        return isNaN(date.getTime()) ? null : date;
    }

    // Handle Excel serials sent as strings
    if (/^\d{5}(\.\d+)?$/.test(dateStr)) {
        return new Date(Math.round((parseFloat(dateStr) - 25569) * 86400 * 1000));
    }

    // Fallback to native parsing (handles YYYY-MM-DD, ISO strings, etc.)
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
};

export const addMedicine = async (req, res) => {
    try {
        const {
            name,
            brand,
            category,
            quantity,
            price,
            expiryDate,
            type = "Medicine", // Default to Medicine
        } = req.body;

        const storeId = req.user.id; // from auth middleware
        const parsedExpiryDate = parseDate(expiryDate);

        // Check if medicine with same name, brand, and category already exists for this store
        const existingMedicine = await Medicine.findOne({
            storeId,
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive match
            brand: brand ? { $regex: new RegExp(`^${brand}$`, 'i') } : { $exists: false },
            category: category ? { $regex: new RegExp(`^${category}$`, 'i') } : { $exists: false },
            type // Exact match for type
        });

        if (existingMedicine) {
            // Merge stock: add quantity
            existingMedicine.quantity += parseInt(quantity) || 0;

            // Update price to the latest
            existingMedicine.price = price;

            // Keep the later expiry date (safer for stock management)
            if (parsedExpiryDate && existingMedicine.expiryDate) {
                existingMedicine.expiryDate = parsedExpiryDate > existingMedicine.expiryDate
                    ? parsedExpiryDate
                    : existingMedicine.expiryDate;
            } else if (parsedExpiryDate) {
                existingMedicine.expiryDate = parsedExpiryDate;
            }

            // Update availability
            existingMedicine.isAvailable = existingMedicine.quantity > 0;

            await existingMedicine.save();

            return res.status(200).json({
                success: true,
                message: "Stock merged with existing medicine",
                medicine: existingMedicine,
                merged: true
            });
        }

        // Create new medicine if no duplicate found
        const medicine = await Medicine.create({
            storeId,
            name,
            brand,
            category,
            quantity,
            price,
            expiryDate: parsedExpiryDate,
            type,
            isAvailable: quantity > 0,
        });

        res.status(201).json({
            success: true,
            medicine,
            merged: false
        });
    } catch (error) {
        console.error("Error adding medicine:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add medicine",
            error: error.message
        });
    }
};

export const getStoreMedicines = async (req, res) => {
    try {
        const storeId = req.user.id;

        const medicines = await Medicine.find({ storeId });

        res.json({ success: true, medicines });
    } catch (error) {
        console.error("Error fetching medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch medicines"
        });
    }
};

export const getReorderSuggestions = async (req, res) => {
    try {
        const storeId = req.user.id;
        const mongoose = await import('mongoose');
        const Bill = (await import('../models/Bill.js')).default;

        // 1. Get bills from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const bills = await Bill.find({
            storeId,
            date: { $gte: sevenDaysAgo }
        });

        // 2. Calculate velocity (quantity sold per day)
        const salesVelocity = {};
        bills.forEach(bill => {
            bill.items.forEach(item => {
                const medId = item.medicineId.toString();
                salesVelocity[medId] = (salesVelocity[medId] || 0) + item.quantity;
            });
        });

        // 3. Get all medicines
        const medicines = await Medicine.find({ storeId });

        // 4. Generate suggestions
        const suggestions = medicines.map(med => {
            const soldTotal = salesVelocity[med._id.toString()] || 0;
            const dailyVelocity = soldTotal / 7;
            const daysOfStockLeft = dailyVelocity > 0 ? med.quantity / dailyVelocity : Infinity;

            return {
                id: med._id,
                name: med.name,
                category: med.category,
                quantity: med.quantity,
                dailyVelocity: parseFloat(dailyVelocity.toFixed(2)),
                daysOfStockLeft: daysOfStockLeft === Infinity ? "N/A" : Math.ceil(daysOfStockLeft),
                priority: daysOfStockLeft < 3 ? "High" : daysOfStockLeft < 7 ? "Medium" : "Low"
            };
        }).filter(s => s.priority !== "Low" || (s.quantity < 5 && s.dailyVelocity > 0))
            .sort((a, b) => {
                if (a.priority === "High" && b.priority !== "High") return -1;
                if (b.priority === "High" && a.priority !== "High") return 1;
                return b.dailyVelocity - a.dailyVelocity;
            });

        res.json({ success: true, suggestions });
    } catch (error) {
        console.error("Error in getReorderSuggestions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reorder suggestions"
        });
    }
};

export const getExpiringMedicines = async (req, res) => {
    try {
        const storeId = req.user.id;
        const days = parseInt(req.query.days) || 30; // Default 30 days
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        const medicines = await Medicine.find({
            storeId,
            expiryDate: { $lte: targetDate, $gt: new Date() }
        }).sort({ expiryDate: 1 });

        res.json({ success: true, medicines });
    } catch (error) {
        console.error("Error fetching expiring medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expiring medicines"
        });
    }
};

export const getLowStockMedicines = async (req, res) => {
    try {
        const storeId = req.user.id;
        const threshold = parseInt(req.query.threshold) || 10;

        const lowStockMedicines = await Medicine.find({
            storeId,
            quantity: { $lte: threshold }
        }).sort({ quantity: 1 }); // Sort by quantity ascending (lowest first)

        res.json({
            success: true,
            medicines: lowStockMedicines,
            count: lowStockMedicines.length
        });
    } catch (error) {
        console.error("Error fetching low stock medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch low stock medicines"
        });
    }
};

export const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.user.id;

        // Find medicine and verify ownership
        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        if (medicine.storeId.toString() !== storeId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this medicine"
            });
        }

        await Medicine.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Medicine deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting medicine:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete medicine",
            error: error.message
        });
    }
};

export const getCatalog = async (req, res) => {
    try {
        const { search, category } = req.query;
        let filteredCatalog = [...medicineCatalog];

        if (category) {
            filteredCatalog = filteredCatalog.filter(
                item => item.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filteredCatalog = filteredCatalog.filter(
                item => item.name.toLowerCase().includes(searchLower) ||
                    item.brand.toLowerCase().includes(searchLower)
            );
        }

        res.json({
            success: true,
            catalog: filteredCatalog
        });
    } catch (error) {
        console.error("Error fetching catalog:", error);
        res.status(500).json({ success: false, message: "Failed to fetch catalog" });
    }
};

export const getCategoryGlobalSearch = async (req, res) => {
    try {
        const { category, search, lat, lng, radius = 5 } = req.query;

        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }

        // Handle singular/plural mismatch (e.g. "Medicines" vs "Medicine")
        let searchCategory = category;
        if (category.toLowerCase().endsWith('s')) {
            searchCategory = category.slice(0, -1);
        }

        const medQuery = {
            category: { $regex: new RegExp(searchCategory, "i") },
            isAvailable: true,
            quantity: { $gt: 0 }
        };

        if (search) {
            medQuery.name = { $regex: search, $options: "i" };
        }

        // Find medicines and populate store info
        let storeMedicines = await Medicine.find(medQuery)
            .populate("storeId", "storeName storeAddress latitude longitude isStoreOpen")
            .lean();

        // Fallback: If no results found in this category, search globally for the name
        // This ensures the "same concept" as the main dashboard search
        if (storeMedicines.length === 0 && search) {
            const globalQuery = {
                name: { $regex: search, $options: "i" },
                isAvailable: true,
                quantity: { $gt: 0 }
            };
            storeMedicines = await Medicine.find(globalQuery)
                .populate("storeId", "storeName storeAddress latitude longitude isStoreOpen")
                .lean();
        }

        // 3. If location provided, filter/sort by distance and include distance info
        let proximalMedicines = [];
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            proximalMedicines = storeMedicines.filter(med => med.storeId).map(med => {
                let distance = null;
                if (med.storeId.latitude && med.storeId.longitude) {
                    const dist = calculateDistance(
                        latitude,
                        longitude,
                        med.storeId.latitude,
                        med.storeId.longitude
                    );
                    distance = parseFloat(dist.toFixed(2));
                }
                return { ...med, distance };
            }).filter(med => med.distance === null || med.distance <= parseFloat(radius))
                .sort((a, b) => {
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    return a.distance - b.distance;
                });
        } else {
            proximalMedicines = storeMedicines;
        }

        res.json({
            success: true,
            storeMedicines: proximalMedicines
        });
    } catch (error) {
        console.error("Error in getCategoryGlobalSearch:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const bulkUploadMedicines = async (req, res) => {
    try {
        if (!req.file) {
            console.error("Bulk upload: No file uploaded");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const storeId = req.user.id;
        console.log(`Starting bulk upload for store: ${storeId}`);

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Use cellDates: true to let XLSX handle date conversion
        const data = XLSX.utils.sheet_to_json(sheet, { cellDates: true });

        console.log(`Parsed ${data.length} rows from file: ${req.file.originalname}`);

        if (data.length === 0) {
            console.warn("Bulk upload: File is empty or has no data rows");
            return res.status(400).json({ success: false, message: "Excel file is empty or headers are missing" });
        }

        // Broaden field detection to be case-insensitive and handle common variations
        const getField = (row, fieldChoices) => {
            const keys = Object.keys(row);
            for (const choice of fieldChoices) {
                const lowerChoice = choice.toLowerCase().trim();
                const foundKey = keys.find(k => k.toLowerCase().trim() === lowerChoice);
                if (foundKey) return row[foundKey];
            }
            return null;
        };

        const medicinesToCreate = data.map((row, index) => {
            const name = getField(row, ["Name", "Medicine Name", "Medicine", "Item Name", "Item"]) || "";
            const brand = getField(row, ["Brand", "Company", "Manufacturer", "Make"]) || "";
            const category = getField(row, ["Category", "Type", "Classification"]) || "General";

            let rawQty = getField(row, ["Quantity", "Qty", "Stock", "Count"]) || 0;
            const quantity = parseInt(rawQty) || 0;

            let rawPrice = getField(row, ["Price", "MRP", "Rate", "Cost"]) || 0;
            const price = parseFloat(rawPrice) || 0;

            let rawExpiry = getField(row, ["Expiry Date", "ExpiryDate", "Expiry", "Exp Date", "Exp. Date", "Exp"]) || null;
            const expiryDate = parseDate(rawExpiry);

            const description = getField(row, ["Description", "Desc", "Info", "Details"]) || "";

            // Detailed logging if a row is potentially problematic
            if (index < 3 || (!expiryDate && name)) {
                console.log(`Row ${index} diagnostic:`, {
                    name: name,
                    rawExpiry: rawExpiry,
                    parsedExpiry: expiryDate,
                    description: !!description,
                    availableKeys: Object.keys(row).slice(0, 8)
                });
            }

            return {
                storeId,
                name: String(name).trim(),
                brand: String(brand).trim(),
                category: String(category).trim(),
                quantity,
                price,
                expiryDate,
                description: String(description).trim(),
                isAvailable: quantity > 0
            };
        }).filter(med => {
            // VALIDATION: Skip row if name is missing OR expiryDate is invalid/missing (since it's required)
            const isValid = med.name && med.name !== "" && med.expiryDate !== null;
            if (!isValid) {
                console.warn(`Skipping invalid row: ${med.name || 'Unknown'} (Reason: ${!med.name ? 'Missing name' : 'Invalid expiry date'})`);
            }
            return isValid;
        });

        console.log(`Filtered to ${medicinesToCreate.length} valid medicines`);

        if (medicinesToCreate.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid medicine data found. Please ensure 'Name' and 'Expiry Date' columns exist and are filled correctly."
            });
        }

        const result = await Medicine.insertMany(medicinesToCreate, { ordered: false });

        res.status(201).json({
            success: true,
            message: `Successfully uploaded ${result.length} medicines`,
            count: result.length
        });
    } catch (error) {
        console.error("CRITICAL: Bulk upload error details:", error);

        // Detailed error logging for validation issues
        if (error.errors) {
            console.error("Validation Errors:", Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`).join(', '));
        }

        // Handle Mongoose bulkWriteErrors
        if (error.name === 'BulkWriteError' || error.name === 'MongoBulkWriteError' || error.writeErrors) {
            const successCount = (error.result && error.result.nInserted) ? error.result.nInserted : 0;
            const errorCount = (error.writeErrors) ? error.writeErrors.length : 0;

            return res.status(207).json({
                success: true,
                message: `Partial success: ${successCount} added, ${errorCount} failed. Check for missing required fields or duplicates.`,
                errorCount: errorCount || (medicinesToCreate ? medicinesToCreate.length - successCount : 0),
                successCount
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to process bulk upload",
            error: error.message || "Unknown error occurred"
        });
    }
};

export const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.user.id;
        const updates = req.body;

        const medicine = await Medicine.findOne({ _id: id, storeId });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found or unauthorized"
            });
        }

        // Parse expiryDate if provided
        if (updates.expiryDate) {
            updates.expiryDate = parseDate(updates.expiryDate);
        }

        // Update isAvailable based on quantity if quantity is updated
        if (updates.quantity !== undefined) {
            updates.isAvailable = updates.quantity > 0;
        }

        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            medicine: updatedMedicine
        });
    } catch (error) {
        console.error("Error updating medicine:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update medicine",
            error: error.message
        });
    }
};

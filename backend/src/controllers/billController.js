import Bill from "../models/Bill.js";
import Medicine from "../models/Medicine.js";
import Visit from "../models/Visit.js";
import Order from "../models/Order.js";
import DailyRecord from "../models/DailyRecord.js";

// Create a new bill/transaction
export const createBill = async (req, res) => {
    try {
        const { items, paymentMethod, customerName, customerPhone } = req.body;
        const storeId = req.user.id;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Bill must contain at least one item"
            });
        }

        // Process items and validate stock
        const processedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const medicine = await Medicine.findById(item.medicineId);

            if (!medicine) {
                return res.status(404).json({
                    success: false,
                    message: `Medicine not found: ${item.medicineId}`
                });
            }

            if (medicine.storeId.toString() !== storeId) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access to medicine"
                });
            }

            if (medicine.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`
                });
            }

            const itemTotal = medicine.price * item.quantity;
            processedItems.push({
                medicineId: medicine._id,
                medicineName: medicine.name,
                quantity: item.quantity,
                price: medicine.price,
                total: itemTotal
            });

            totalAmount += itemTotal;

            // Deduct stock
            medicine.quantity -= item.quantity;
            medicine.isAvailable = medicine.quantity > 0;
            await medicine.save();
        }

        // Generate bill number
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const lastBill = await Bill.findOne({ storeId })
            .sort({ createdAt: -1 });

        let sequence = 1;
        if (lastBill && lastBill.billNumber.startsWith(`BILL-${today}`)) {
            sequence = parseInt(lastBill.billNumber.split('-')[2]) + 1;
        }

        const billNumber = `BILL-${today}-${sequence.toString().padStart(3, '0')}`;

        // Create bill
        const bill = await Bill.create({
            storeId,
            billNumber,
            items: processedItems,
            totalAmount,
            paymentMethod: paymentMethod || "cash",
            customerName,
            customerPhone,
            date: new Date()
        });

        // Update daily record
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            await DailyRecord.findOneAndUpdate(
                { storeId, date: startOfToday },
                {
                    $inc: {
                        totalSales: totalAmount,
                        billCount: 1,
                        salesFromBills: totalAmount
                    }
                },
                { upsert: true, new: true }
            );
        } catch (recordError) {
            console.error("Error updating daily record:", recordError);
            // Don't fail the bill creation if daily record fails
        }

        res.status(201).json({
            success: true,
            bill
        });

    } catch (error) {
        console.error("Error creating bill:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create bill",
            error: error.message
        });
    }
};

// Get daily statistics
export const getDailyStats = async (req, res) => {
    try {
        const storeId = req.user.id;

        // Get start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Get start of yesterday
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        // Convert storeId to ObjectId for aggregation
        const mongoose = await import('mongoose');
        const storeObjectId = new mongoose.default.Types.ObjectId(storeId);

        // Total Sales Today (Bills + Confirmed Orders)
        const billsSalesToday = await Bill.aggregate([
            { $match: { storeId: storeObjectId, date: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const ordersSalesToday = await Order.aggregate([
            { $match: { storeId: storeObjectId, status: { $in: ["approved", "confirmed"] }, createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const totalSalesToday = (billsSalesToday[0]?.total || 0) + (ordersSalesToday[0]?.total || 0);

        // Total Sales Yesterday
        const billsSalesYesterday = await Bill.aggregate([
            { $match: { storeId: storeObjectId, date: { $gte: startOfYesterday, $lt: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const ordersSalesYesterday = await Order.aggregate([
            { $match: { storeId: storeObjectId, status: { $in: ["approved", "confirmed"] }, createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const totalSalesYesterday = (billsSalesYesterday[0]?.total || 0) + (ordersSalesYesterday[0]?.total || 0);

        const salesChange = totalSalesYesterday > 0
            ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday * 100).toFixed(0)
            : 0;

        // Orders Today (Bills + All Orders created today except cancelled)
        const billsCountToday = await Bill.countDocuments({
            storeId: storeId,
            date: { $gte: startOfToday }
        });

        const ordersCountToday = await Order.countDocuments({
            storeId: storeId,
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfToday }
        });

        const totalOrdersToday = billsCountToday + ordersCountToday;

        // Orders Yesterday
        const billsCountYesterday = await Bill.countDocuments({
            storeId: storeId,
            date: { $gte: startOfYesterday, $lt: startOfToday }
        });

        const ordersCountYesterday = await Order.countDocuments({
            storeId: storeId,
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfYesterday, $lt: startOfToday }
        });

        const totalOrdersYesterday = billsCountYesterday + ordersCountYesterday;

        const ordersChange = totalOrdersYesterday > 0
            ? ((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday * 100).toFixed(0)
            : 0;

        // Low Stock Count
        const lowStockCount = await Medicine.countDocuments({
            storeId: storeId,
            quantity: { $lte: 10 }
        });

        // Profile Visits Today
        const visitToday = await Visit.findOne({
            storeId: storeId,
            date: { $gte: startOfToday }
        });

        const visitYesterday = await Visit.findOne({
            storeId: storeId,
            date: { $gte: startOfYesterday, $lt: startOfToday }
        });

        const visitsToday = visitToday?.count || 0;
        const visitsYesterdayCount = visitYesterday?.count || 0;
        const visitsChange = visitsYesterdayCount > 0
            ? ((visitsToday - visitsYesterdayCount) / visitsYesterdayCount * 100).toFixed(0)
            : 0;

        res.json({
            success: true,
            stats: {
                totalSales: totalSalesToday,
                salesChange: parseInt(salesChange),
                ordersToday: totalOrdersToday,
                ordersChange: parseInt(ordersChange),
                lowStockCount: lowStockCount,
                profileVisits: visitsToday,
                visitsChange: parseInt(visitsChange)
            }
        });

    } catch (error) {
        console.error("Error fetching daily stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch daily stats",
            error: error.message
        });
    }
};

// Get all bills for a store
export const getStoreBills = async (req, res) => {
    try {
        const storeId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;

        const bills = await Bill.find({ storeId })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            bills
        });

    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bills",
            error: error.message
        });
    }
};

// Increment visit count
export const incrementVisit = async (req, res) => {
    try {
        const { storeId } = req.body;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "Store ID is required"
            });
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(startOfToday);
        endOfToday.setHours(23, 59, 59, 999);

        // Try to find today's visit record with exact date match
        let visit = await Visit.findOne({
            storeId: storeId,
            date: startOfToday
        });

        if (visit) {
            // Increment existing count
            visit.count += 1;
            await visit.save();
        } else {
            // Create new visit record for today
            visit = await Visit.create({
                storeId: storeId,
                date: startOfToday,
                count: 1
            });
        }

        // Update daily record
        try {
            await DailyRecord.findOneAndUpdate(
                { storeId, date: startOfToday },
                { $set: { visitCount: visit.count } },
                { upsert: true, new: true }
            );
        } catch (recordError) {
            console.error("Error updating daily record:", recordError);
        }

        res.json({
            success: true,
            visit
        });

    } catch (error) {
        console.error("Error incrementing visit:", error);
        res.status(500).json({
            success: false,
            message: "Failed to increment visit",
            error: error.message
        });
    }
};

// Get visit history
export const getVisitHistory = async (req, res) => {
    try {
        const storeId = req.user.id;
        const limit = parseInt(req.query.limit) || 30;

        const visits = await Visit.find({ storeId })
            .sort({ date: -1 })
            .limit(limit);

        res.json({
            success: true,
            visits
        });

    } catch (error) {
        console.error("Error fetching visit history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch visit history",
            error: error.message
        });
    }
};

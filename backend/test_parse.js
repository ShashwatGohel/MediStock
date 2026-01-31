import * as XLSX from "xlsx";
import fs from "fs";

async function testParsing() {
    try {
        console.log("Testing XLSX parsing with a mock buffer...");
        const content = 'Name,Brand,Category,Quantity,Price,Expiry Date\nTest Med 1,Test Brand,Fever,50,25.00,2026-12-31';
        const buffer = Buffer.from(content);

        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log("Parsed Data:", data);

        const medicinesToCreate = data.map((row, index) => {
            const name = row.Name || row.name || row.NAME || row["Medicine Name"] || row["Medicine"] || "";
            const brand = row.Brand || row.brand || row.BRAND || row["Company"] || "";
            const category = row.Category || row.category || row.CATEGORY || "General";

            let rawQty = row.Quantity || row.quantity || row.qty || row.QTY || 0;
            const quantity = parseInt(rawQty) || 0;

            let rawPrice = row.Price || row.price || row.PRICE || row.MRP || 0;
            const price = parseFloat(rawPrice) || 0;

            let expiryDate = row["Expiry Date"] || row.expiryDate || row.expiry || row.EXP || null;

            return {
                name: String(name).trim(),
                brand: String(brand).trim(),
                category: String(category).trim(),
                quantity,
                price,
                expiryDate,
                isAvailable: quantity > 0
            };
        }).filter(med => med.name && med.name !== "");

        console.log("Processed Medicines:", medicinesToCreate);
        console.log("Test Passed!");
    } catch (error) {
        console.error("Test Failed with error:", error);
    }
}

testParsing();

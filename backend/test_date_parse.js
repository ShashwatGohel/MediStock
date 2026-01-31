const parseDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;

    const dateStr = String(dateVal).trim();

    // Check for DD-MM-YYYY format
    const ddmmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const match = dateStr.match(ddmmmyyyy);

    if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        const year = parseInt(match[3]);
        return new Date(year, month, day);
    }

    // Fallback to native parsing
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
};

const testDate = "15-08-2027";
const result = parseDate(testDate);
console.log(`Input: ${testDate}`);
console.log(`Result: ${result}`);
console.log(`ISO Format: ${result.toISOString().split('T')[0]}`);

if (result.getFullYear() === 2027 && result.getMonth() === 7 && result.getDate() === 15) {
    console.log("SUCCESS: Date parsed correctly!");
} else {
    console.error("FAILURE: Date parsing failed!");
    process.exit(1);
}

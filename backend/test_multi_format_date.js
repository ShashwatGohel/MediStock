const parseDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;

    if (typeof dateVal === 'number') {
        return new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    }

    const dateStr = String(dateVal).trim();
    const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    const match = dateStr.match(ddmmyyyy);

    if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        return new Date(year, month, day);
    }

    if (!isNaN(dateStr) && dateStr.length > 4) {
        return new Date(Math.round((parseFloat(dateStr) - 25569) * 86400 * 1000));
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
};

const testCases = [
    { input: "15-08-2027", expected: "2027-08-15" },
    { input: "15/08/2027", expected: "2027-08-15" },
    { input: 46614, expected: "2027-08-15" }, // Excel serial for 2027-08-15
    { input: "2027-08-15T00:00:00.000Z", expected: "2027-08-15" },
    { input: "Invalid Date", expected: null }
];

testCases.forEach(({ input, expected }) => {
    const result = parseDate(input);
    const resultStr = result ? result.toISOString().split('T')[0] : null;
    console.log(`Input: ${JSON.stringify(input)} -> Parsed: ${resultStr}`);

    if (resultStr === expected) {
        console.log("✅ Match!");
    } else if (expected === null && result === null) {
        console.log("✅ Correctly rejected!");
    } else {
        console.error(`❌ Mismatch! Expected ${expected}`);
    }
});

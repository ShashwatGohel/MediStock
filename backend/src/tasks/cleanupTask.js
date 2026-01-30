import cron from "node-cron";
import Bill from "../models/Bill.js";
import Order from "../models/Order.js";

const initCleanupTask = () => {
    // Schedule task to run at 12:00 AM every day
    // "0 0 * * *" = Minute 0, Hour 0, Day *, Month *, Weekday *
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Daily Cleanup Task: Deleting transactions older than 24 hours...");

        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 1. Hide Bills older than 24 hours from Owner Dashboard
            // Records are KEPT in DB for persistent statistics as requested
            const hiddenBills = await Bill.updateMany(
                { date: { $lt: twentyFourHoursAgo }, hiddenFromStore: false },
                { $set: { hiddenFromStore: true } }
            );

            // 2. Hide Orders older than 24 hours from Owner Dashboard
            const hiddenOrders = await Order.updateMany(
                { createdAt: { $lt: twentyFourHoursAgo }, hiddenFromStore: false },
                { $set: { hiddenFromStore: true } }
            );

            console.log(`Auto-Hide Complete: ${hiddenBills.modifiedCount} Bills and ${hiddenOrders.modifiedCount} Orders hidden from dashboard frontend.`);
        } catch (error) {
            console.error("Cleanup Task Error:", error);
        }
    });

    console.log("System Status: Daily automated cleanup task scheduled.");
};

export default initCleanupTask;

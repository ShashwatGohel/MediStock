import cron from "node-cron";
import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";

const initPreservationCleanupTask = () => {
    // Schedule task to run every minute
    cron.schedule("* * * * *", async () => {
        console.log("Running Preservation Cleanup Task: Checking for expired reservations...");

        try {
            const now = new Date();

            // Find orders that are approved but expired
            const expiredOrders = await Order.find({
                status: "approved",
                preservationExpiresAt: { $lt: now }
            });

            if (expiredOrders.length === 0) {
                console.log("No expired reservations found.");
                return;
            }

            for (const order of expiredOrders) {
                console.log(`Cleaning up expired order: ${order._id}`);

                // Restore quantities for each item in the order
                for (const item of order.items) {
                    const medicine = await Medicine.findById(item.medicineId);
                    if (medicine) {
                        medicine.quantity += item.quantity;
                        medicine.reservedQuantity = Math.max(0, medicine.reservedQuantity - item.quantity);
                        await medicine.save();
                    }
                }

                // Update order status to cancelled
                order.status = "cancelled";
                await order.save();

                console.log(`Order ${order._id} has been automatically cancelled due to expiration.`);
            }

            console.log(`Preservation Cleanup Complete: ${expiredOrders.length} orders processed.`);
        } catch (error) {
            console.error("Preservation Cleanup Task Error:", error);
        }
    });

    console.log("System Status: Preservation cleanup task scheduled (every 5 minutes).");
};

export default initPreservationCleanupTask;

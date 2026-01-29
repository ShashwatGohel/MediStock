import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";
import Store from "../models/Store.js";

export const createOrder = async (req, res) => {
    try {
        const { storeId, items, totalAmount, prescriptionImage } = req.body;
        const userId = req.user.id;

        // Check availability and reserve logic if needed, 
        // but User requested: "if the store owner approves that then the quantity in the store will get changed"
        // So create order as pending, owner approves -> change quantity.

        const order = await Order.create({
            userId,
            storeId,
            items,
            totalAmount,
            prescriptionImage,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).populate("storeId", "storeName storeAddress");
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

export const getStoreOrders = async (req, res) => {
    try {
        const storeId = req.user.id; // Store owner ID
        const orders = await Order.find({ storeId }).populate("userId", "name phone");
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch store orders" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const storeOwnerId = req.user.id;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.storeId.toString() !== storeOwnerId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const oldStatus = order.status;

        // Inventory Logic
        if (status === "approved" && oldStatus === "pending") {
            // "if the store owner approves that then the quantity in the store will get changed"
            // "the store will approve the trade temporarily telling that they have kept the medicines aside"
            for (const item of order.items) {
                const medicine = await Medicine.findById(item.medicineId);
                if (!medicine || medicine.quantity < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${item.medicineName}`
                    });
                }
                medicine.quantity -= item.quantity;
                medicine.reservedQuantity += item.quantity;
                await medicine.save();
            }
        } else if (status === "confirmed" && oldStatus === "approved") {
            // "after the owner gives or confirms the trade then the quantity will get updated in the real database"
            // (Quantity already decreased, now just clear reserved)
            for (const item of order.items) {
                const medicine = await Medicine.findById(item.medicineId);
                if (medicine) {
                    medicine.reservedQuantity -= item.quantity;
                    await medicine.save();
                }
            }
        } else if (status === "cancelled" && oldStatus === "approved") {
            // "if the trade is cancelled then the quantity is set to the original one"
            for (const item of order.items) {
                const medicine = await Medicine.findById(item.medicineId);
                if (medicine) {
                    medicine.quantity += item.quantity;
                    medicine.reservedQuantity -= item.quantity;
                    await medicine.save();
                }
            }
        }

        order.status = status;
        await order.save();

        res.json({ success: true, order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Failed to update order status" });
    }
};

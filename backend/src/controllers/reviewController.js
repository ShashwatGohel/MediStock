import Review from "../models/Review.js";
import User from "../models/User.js";

export const addReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, rating, comment } = req.body;

        // Check if user already reviewed this store
        const existingReview = await Review.findOne({ userId, storeId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this store" });
        }

        const review = await Review.create({
            userId,
            storeId,
            rating,
            comment
        });

        // Optional: Trigger average rating calculation here or handle on fetch

        res.status(201).json({ success: true, review });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ success: false, message: "Failed to add review" });
    }
};

export const getStoreReviews = async (req, res) => {
    try {
        const { storeId } = req.params;
        const reviews = await Review.find({ storeId })
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        // Calculate average rating
        const stats = await Review.aggregate([
            { $match: { storeId: new (await import('mongoose')).default.Types.ObjectId(storeId) } },
            { $group: { _id: "$storeId", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            reviews,
            stats: stats[0] || { averageRating: 0, count: 0 }
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await Review.findOneAndDelete({ _id: id, userId });
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        res.json({ success: true, message: "Review deleted" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
};

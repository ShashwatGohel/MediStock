import express from "express";
import {
  getNearbyStores,
  searchStoresByMedicine,
  getStoreById,
  getStoreMedicines,
  updateStoreLocation,
} from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/nearby", getNearbyStores);
router.get("/search", searchStoresByMedicine);
router.get("/:storeId", getStoreById);
router.get("/:storeId/medicines", getStoreMedicines);
router.put("/location", protect, updateStoreLocation);

export default router;




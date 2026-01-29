import express from "express";
import {
  getNearbyStores,
  searchStoresByMedicine,
  getStoreById,
  getStoreMedicines,
  updateStoreLocation,
  toggleSaveStore,
  getSavedStores,
} from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/nearby", getNearbyStores);
router.get("/search", searchStoresByMedicine);
router.get("/:storeId", getStoreById);
router.get("/:storeId/medicines", getStoreMedicines);
router.put("/location", protect, updateStoreLocation);
router.post("/toggle-save/:storeId", protect, toggleSaveStore);
router.get("/saved", protect, getSavedStores);

export default router;




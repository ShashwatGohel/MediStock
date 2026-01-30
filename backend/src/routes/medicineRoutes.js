import express from "express";
import {
    addMedicine,
    getStoreMedicines,
    getLowStockMedicines,
    deleteMedicine,
    getCatalog,
    getCategoryGlobalSearch,
} from "../controllers/medicineController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addMedicine);
router.get("/my-medicines", authMiddleware, getStoreMedicines);
router.get("/low-stock", authMiddleware, getLowStockMedicines);
router.get("/catalog", getCatalog);
router.get("/category-search", getCategoryGlobalSearch);
router.delete("/delete/:id", authMiddleware, deleteMedicine);

export default router;



import express from "express";
import {
    addMedicine,
    getStoreMedicines,
    getLowStockMedicines,
    deleteMedicine,
    getCatalog,
    getCategoryGlobalSearch,
    bulkUploadMedicines,
    updateMedicine
} from "../controllers/medicineController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/add", authMiddleware, addMedicine);
router.get("/my-medicines", authMiddleware, getStoreMedicines);
router.get("/low-stock", authMiddleware, getLowStockMedicines);
router.get("/catalog", getCatalog);
router.get("/category-search", getCategoryGlobalSearch);
router.delete("/delete/:id", authMiddleware, deleteMedicine);
router.patch("/update/:id", authMiddleware, updateMedicine);
router.post("/bulk-upload", authMiddleware, upload.single("file"), bulkUploadMedicines);

export default router;



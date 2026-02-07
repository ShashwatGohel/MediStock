import express from "express";
import { addVaultItem, getVaultItems, deleteVaultItem, updateVaultItem } from "../controllers/vaultController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/add", addVaultItem);
router.get("/my-vault", getVaultItems);
router.patch("/update/:id", updateVaultItem);
router.delete("/delete/:id", deleteVaultItem);

export default router;

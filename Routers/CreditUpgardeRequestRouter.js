import express from "express";
import {
  createCreditUpgrade,
  getAllCreditUpgrades,
  getCreditUpgradeById,
  updateCreditUpgradeStatus,
  deleteCreditUpgrade,
} from "../Controllers/CreditUpgardeRequestCtrl.js";

import upload from "../Utils/multer.js";

const router = express.Router();

router.post("/CreditUpgardeRequest", upload.single("document"), createCreditUpgrade);
router.get("/CreditUpgardeRequest", getAllCreditUpgrades);
router.get("/CreditUpgardeRequest", getCreditUpgradeById);
router.patch("/updateCreditUpgradeStatus/:id", updateCreditUpgradeStatus);
router.delete("/CreditUpgardeRequest/:id", deleteCreditUpgrade);

export default router;

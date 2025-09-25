// routes/paymentRoutes.js
import express from "express";
import { logins, CreateCustumer, getCustumers, UpdateCustumerStatus, deleteCustomer, updateCustomer, getCustomerNames, autoDeductInstallments } from "../Controllers/CustumerCtrl.js";

import upload from "../Utils/multer.js";
import { authMiddleware, isAdmin, isCustumer } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/login", logins);
router.get("/custumers", getCustumers);

router.post(
  "/createcustumer",
  upload.fields([
    { name: "gstDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
  ]),
  CreateCustumer
);

router.put(
  "/updateCustumer/:id",
  authMiddleware,
  // isCustumer,
  updateCustomer
);

router.patch("/updatecustomerstatus/:id", authMiddleware, UpdateCustumerStatus);
router.get("/autoDeductInstallments",autoDeductInstallments);
router.delete("/deleteCustomer/:id", authMiddleware, isAdmin, deleteCustomer);
router.get("/customer-names", getCustomerNames);

export default router;

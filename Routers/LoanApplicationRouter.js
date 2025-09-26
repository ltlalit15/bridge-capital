// routes/paymentRoutes.js
import express from "express";

import { createLoanApplication, deleteLoanApplication, getAllLoanApplications, getCustomerApplications, getLoanApplicationById } from "../Controllers/LoanApplicationCtrl.js";
import multer from "multer";


const router = express.Router();


const upload = multer({ dest: "uploads/" });

router.post("/createloanapplication", upload.array("documents"), createLoanApplication);
router.get("/loanApplication", getAllLoanApplications );
router.get("/loanApplication/:id", getLoanApplicationById );
router.get(`/loanApplication/customer/:customerId`,getCustomerApplications)
router.delete("/loanapplication/:id", deleteLoanApplication);


export default router;

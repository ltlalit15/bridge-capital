// routes/paymentRoutes.js
import express from "express";

import { createLoanApplication, deleteLoanApplication, getAllLoanApplications, getCustomerApplications, getLoanApplicationById, updateLoanApplication, updateLoanApplicationStatus } from "../Controllers/LoanApplicationCtrl.js";
import multer from "multer";


const router = express.Router();


const upload = multer({ dest: "uploads/" });

router.post("/createloanapplication",  upload.array("documents", 10), createLoanApplication);
router.get("/loanApplication", getAllLoanApplications );
router.get("/loanApplication/:id", getLoanApplicationById );
router.patch("/loanApplication/:id", updateLoanApplication );
router.get(`/loanApplication/customer/:customerId`,getCustomerApplications);
router.patch("/loanApplication/status/:id", updateLoanApplicationStatus);
router.delete("/loanapplication/:id", deleteLoanApplication);


export default router;

import express from "express";
import {
    createWithdraw,
    getAllWithdrawals,
    withdrawstatusupdate,
    getWithdrwByCustomerId
} from "../Controllers/WithdrawCtrl.js";

import { authMiddleware, isAdmin, isCustumer } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/withdrawpayment", createWithdraw);
router.get("/getallwithdrawpayment", getAllWithdrawals);
router.patch("/withdrawstatusupdate/:id", withdrawstatusupdate);
router.get("/getWithdrwBycustomerId/:customerId", getWithdrwByCustomerId)

export default router;

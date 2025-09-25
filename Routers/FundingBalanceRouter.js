import express from "express";
import {
    FundingBalance
} from "../Controllers/FundingBalanceCtrl.js";

import { authMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/getfundingbalance",  FundingBalance);

export default router;

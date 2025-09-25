import express from "express";
import {
    createEarlyPayoffRequest,
    getAllEarlyPayoffs,
    approveEarlyPayoff
} from "../Controllers/EarlyPayoffManagmentCtrl.js";

import { authMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/earlyPayoff", createEarlyPayoffRequest);
router.patch("/updateEarlyPayoffStatus/:id", approveEarlyPayoff);
router.get("/getAllEarlyPayoffs", getAllEarlyPayoffs);

export default router;

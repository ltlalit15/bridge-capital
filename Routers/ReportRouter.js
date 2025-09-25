import express from "express";
import {
    getReport
} from "../Controllers/ReportCtrl.js";

import { authMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/report",  getReport);

export default router;

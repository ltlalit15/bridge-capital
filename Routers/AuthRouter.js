// routes/paymentRoutes.js
import express from "express";
import { logins, changePassword, forgotPassword, resetPassword } from "../Controllers/AuthCtrl.js";
import { authMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/login", logins);
router.patch("/change-password/:id", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


export default router;

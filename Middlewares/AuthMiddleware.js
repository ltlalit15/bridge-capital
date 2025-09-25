import User from '../Models/CustumerModel.js'
import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"

export const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req?.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401);
        throw new Error("No token provided in header");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id).select("-password");

        if (!user) {
            res.status(401);
            throw new Error("User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not Authorized, token failed or expired");
    }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== "admin") {
        throw new Error("You are not an admin");
    } else {
        next();
    }
});

export const isCustumer = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== "customer") {
        throw new Error("You are not an customer");
    } else {
        next();
    }
});


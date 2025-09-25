import Notifiaction from "../Models/NotifiactionModel.js";
import asyncHandler from "express-async-handler";

export const getNotification = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    const getNotificationData = await Notifiaction.find({ customerId }).populate({
        path: 'customerId',
        select: 'einNumber'
    });

    const result = getNotificationData.map((item) => ({
        _id: item._id,
        customerId: item?.customerId?._id,
        einNumber: item?.customerId?.einNumber,
        message: item?.message,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
        __v: item.__v,
    }));

    return res.status(200).json({ data: result });
});


export const getAdminNotification = asyncHandler(async (req, res) => {
  const notifications = await Notifiaction.find().populate({
    path: 'customerId',
    select: 'customerName einNumber',
  });

  const formattedData = notifications.map((notif) => ({
    id: notif._id,
    customerName: notif.customerId?.customerName || "N/A",
    customerId: notif.customerId?._id || "N/A",
    einNumber: notif.customerId?.einNumber || "N/A", // ✅ fix here
    message: notif.message,
    createdAt: notif.createdAt,
    updatedAt: notif.updatedAt,
  }));

  return res.status(200).json({ data: formattedData });
});



import mongoose from "mongoose";

export const sendNotification = asyncHandler(async (req, res) => {
    const { customerId, message } = req.body;

    if (!customerId || !message) {
        return res.status(400).json({ success: false, message: "customerId and message are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({ success: false, message: "Invalid customerId." });
    }

    const newNotification = await Notifiaction.create({ customerId, message });

    return res.status(201).json({ success: true, data: newNotification });
});

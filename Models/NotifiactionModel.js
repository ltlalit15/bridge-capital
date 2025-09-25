// Models/WithdrawModel.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        message: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;

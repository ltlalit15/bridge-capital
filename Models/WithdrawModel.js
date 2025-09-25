// Models/WithdrawModel.js
import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        approvedCreditLine: { type: String },//10000
        availableAmount: { type: String },//10000
        withdrawAmount: { type: String },
        remainingCreditLine: { type: String },
        withdrawStatus: { type: String, default: "pending" },
        firstPaymentStatus: { type: String, default: "inComplete" },
        amountCredited: { type: Number, default: 0 },
        amountCredited: { type: Number },

    },
    {
        timestamps: true,
    }
);

const Withdraw = mongoose.model("Withdraw", withdrawSchema);

export default Withdraw;

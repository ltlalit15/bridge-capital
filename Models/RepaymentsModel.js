// Models/WithdrawModel.js
import mongoose from "mongoose";

const RepaymentSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        payAmount: {
            type: String
        },
        payStatus: {
            type: String,
            default: "pending"
        },
    },
    {
        timestamps: true,
    }
);

const Repayment = mongoose.model("Repayment", RepaymentSchema);

export default Repayment;

import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema({
    discountTen: { type: String },
    startDateTen: { type: String },
    endDateTen: { type: String },

    discountFive: { type: String },
    startDateFive: { type: String },
    endDateFive: { type: String },
    earlyPayoffStatus: {
        type: String,
        default: "pending"
    },
    discountStatus: {
        type: String,
        default: "Active",
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },
}, {
    timestamps: true
});

export default mongoose.model("Discount", DiscountSchema);

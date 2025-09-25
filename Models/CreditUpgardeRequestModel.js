import mongoose from "mongoose";

const creditUpgradeSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  requestedAmount: {
    type: String,
  },
  document: {
    type: String,
  },
  creditUpgradeStatus: {
    type: String,
    default: "pending",
  },
}, {
  timestamps: true,
});

export default mongoose.model("CreditUpgrade", creditUpgradeSchema);

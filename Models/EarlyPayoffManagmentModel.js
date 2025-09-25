import mongoose from "mongoose";

const earlyPayoffSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  earlyPayAmount: {
    type: String,
  },
  discount: {
    type: String,
  },
  discountAmount: {
    type: String,
  },
  requestDate: {
    type: String,
  },
  earlyPayoffStatus: {
    type: String,
    default: "pending"
  },
  
}, {
  timestamps: true
});

const EarlyPayoff = mongoose.model("EarlyPayoff", earlyPayoffSchema);
export default EarlyPayoff;

import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  loan_amount: { type: Number, required: true },
  loan_purpose: { type: String, required: true },
  loan_tenure: { type: Number, required: true }, // in months
  monthly_income: { type: Number, required: true },
  documents: [String],   // ✅ store only array of URLs
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);

export default LoanApplication;
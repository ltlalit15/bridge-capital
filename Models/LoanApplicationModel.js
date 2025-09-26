import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  loan_amount: { type: Number, required: true },
  loan_purpose: { type: String, required: true },
  loan_tenure: { type: Number, required: true }, // in months
  monthly_income: { type: Number, required: true },
  documents: [
    {
      name: { type: String },
      url: { type: String }, // file path or cloud URL
    }
  ],
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  createdAt: { type: Date, default: Date.now },


});

const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);

export default LoanApplication;
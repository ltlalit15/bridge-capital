import Repayment from "../Models/RepaymentsModel.js";
import Withdraw from "../Models/WithdrawModel.js";
import asyncHandler from "express-async-handler";
import Customer from "../Models/CustumerModel.js";

export const FundingBalance = asyncHandler(async (req, res) => {
  const withdrawals = await Withdraw.find({ withdrawStatus: "Approved" })
    .populate("customerId", "customerName einNumber");

  const repayments = await Repayment.find()
    .populate("customerId", "customerName einNumber");

  const findCustomer = await Customer.find();

  const totalDrawn = withdrawals.reduce((acc, curr) => acc + Number(curr.withdrawAmount || 0), 0);
  const totalRepayments = repayments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const remainingBalance = findCustomer.reduce((acc, curr) => acc + Number(curr.remainingRepayment || 0), 0);

  const formattedWithdrawals = withdrawals.map((item) => ({
    _id: item._id,
    type: "withdraw",
    withdrawAmount: item.withdrawAmount,
    withdrawStatus: item.withdrawStatus,
    approvedCreditLine: item.approvedCreditLine,
    availableAmount: item.availableAmount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    customerName: item.customerId?.customerName || "Unknown",
    einNumber: item.customerId?.einNumber || "Unknown",
    customerId: item.customerId?._id || "Unknown"

  }));

  const formattedRepayments = repayments.map((item) => ({
    _id: item._id,
    type: "repayment",
    amount: item.amount,
    repaymentMode: item.repaymentMode,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    customerName: item.customerId?.customerName || "Unknown",
    einNumber: item.customerId?.einNumber || "Unknown",
    customerId: item.customerId?._id || "Unknown"
  }));

  const mergedData = [...formattedWithdrawals, ...formattedRepayments];
  mergedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({
    success: true,
    summary: {
      totalDrawn,
      totalRepayments,
      remainingBalance
    },
    records: mergedData
  });
});

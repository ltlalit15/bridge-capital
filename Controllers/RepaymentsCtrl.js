// Controllers/WithdrawController.js
import Repayment from "../Models/RepaymentsModel.js";
import Custumer from "../Models/CustumerModel.js";
import asyncHandler from "express-async-handler";
import moment from "moment";


export const repayments = asyncHandler(async (req, res) => {
  const { customerId, payAmount } = req.body;

  // Get current month start and end
  const startOfMonth = moment().startOf("month").toDate();
  const endOfMonth = moment().endOf("month").toDate();

  // Check if repayment already exists in this month
  const existingRepayment = await Repayment.findOne({
    customerId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (existingRepayment) {
    return res.status(400).json({ message: "Customer has already made repayment this month." });
  }

  // Else, allow repayment
  const Pay = await Repayment.create({
    customerId,
    payAmount,
  });

  res.status(201).json({
    message: `Paid successfully`,
    Pay,
  });
});
;

export const getrepayments = asyncHandler(async (req, res) => {
  const { customerId, id } = req.query;

  let filter = {};

  if (id) {
    filter._id = id;
  } else if (customerId) {
    filter.customerId = customerId;
  }

  const result = await Repayment.find(filter)
    .populate("customerId", "customerName");

  res.status(200).json({
    message: "Repayments fetched successfully ✅",
    total: result.length,
    result,
  });
});

export const paymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payStatus } = req.body;

  const repayment = await Repayment.findById(id);
  if (!repayment) {
    res.status(404);
    throw new Error("Repayment record not found");
  }

  const updatedpayStatus = await Repayment.findByIdAndUpdate(
    id,
    { payStatus },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (payStatus === "paid") {
    const payCustomerId = updatedpayStatus.customerId;
    const payAmountData = Number(updatedpayStatus.payAmount);

    const customer = await Custumer.findById(payCustomerId);
    if (!customer) {
      res.status(404);
      throw new Error("Customer not found");
    }

    const remainPay = Number(customer.remainingRepayment) || 0;
    const updatedRemaining = remainPay - payAmountData;

    await Custumer.findByIdAndUpdate(
      payCustomerId,
      { remainingRepayment: updatedRemaining }
    );
  }

  res.status(200).json({
    message: "Pay status updated successfully ✅",
    customerId: updatedpayStatus.customerId,
    updatedStatus: updatedpayStatus.payStatus,
  });
});

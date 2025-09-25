import Customer from "../Models/CustumerModel.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { generateToken } from "../Config/jwtToken.js";
import crypto from "crypto";
import Withdraw from "../Models/WithdrawModel.js"

export const logins = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ✅ Suspended customer check
  if (customer.customerStatus === "Suspended") {
    return res.status(403).json({
      message: "Your account is suspended. Please contact admin.",
    });
  }

  const token = generateToken(customer._id);

  const withdrawals = await Withdraw.find({ customerId: customer._id, withdrawStatus: "Approved" });

  let totalWithdrawAmount = 0;
  let approvedCreditLine = 0;
  let minimumWithdrawl = false;

  if (withdrawals.length > 0) {
    withdrawals.forEach((withdraw) => {
      totalWithdrawAmount += Number(withdraw.withdrawAmount || 0);
      if (!approvedCreditLine && withdraw.approvedCreditLine) {
        approvedCreditLine = Number(withdraw.approvedCreditLine);
      }
    });

    const tenPercent = approvedCreditLine * 0.10;
    minimumWithdrawl = totalWithdrawAmount >= tenPercent;
  }

  // ✅ Credit Increase Eligibility Logic
  let creditIncrease = false;

  if (
    customer.totalRepayment &&
    customer.remainingRepayment &&
    approvedCreditLine > 0
  ) {
    const remainingPercent = (customer.remainingRepayment / customer.totalRepayment) * 100;
    const totalWithdrawAmountData = customer.totalRepayment - customer.remainingRepayment;
    const withdrawPercent = (totalWithdrawAmountData / approvedCreditLine) * 100;

    if (remainingPercent <= 50 && withdrawPercent >= 50) {
      creditIncrease = true;
    }
  }

  // ✅ If admin, get total customer count
  let totalCustomers = 0;
  let pendingRequest = 0;
  let approvedRequest = 0;
  if (customer.role === "admin") {
    totalCustomers = await Customer.countDocuments({ role: 'customer' });
    pendingRequest = await Withdraw.countDocuments({ withdrawStatus: 'pending' })
    approvedRequest = await Withdraw.countDocuments({ withdrawStatus: 'Approved' })
  }
  res.status(200).json({
    message: "Login successful",
    customer: {
      id: customer._id,
      customerName: customer.customerName,
      companyName: customer.companyName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      creditLine: customer.creditLine,
      factorRate: customer.factorRate,
      gstDoc: customer.gstDoc,
      panDoc: customer.panDoc,
      role: customer.role,
      remainingRepayment: customer.remainingRepayment,
      token,
      minimumWithdrawl,
      requiredMinimumAmount: customer.approvedAmount * 10 / 100,
      creditIncrease,
      ...(customer.role === "admin" && { totalCustomers, pendingRequest, approvedRequest }), // ✅ only include if admin
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;

  if (!password) {
    res.status(400);
    throw new Error("New password is required");
  }

  const customer = await Customer.findById(id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await Customer.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  );

  res.status(200).json({ message: "Password updated successfully" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer) {
    res.status(404);
    throw new Error("User not found");
  }

  const token = crypto.randomBytes(20).toString("hex");

  customer.resetToken = token;
  customer.resetTokenExpiry = Date.now() + 3600000;
  await customer.save();


  res.status(200).json({
    message: "Reset token generated",
    resetToken: token,
    note: "Use this token in /reset-password/:token API",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const customer = await Customer.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!customer) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  customer.password = hashedPassword;
  customer.resetToken = undefined;
  customer.resetTokenExpiry = undefined;

  await customer.save();

  res.status(200).json({ message: "Password reset successful" });
});



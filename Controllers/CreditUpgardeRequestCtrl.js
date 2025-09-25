import asyncHandler from "express-async-handler";
import CreditUpgrade from "../Models/CreditUpgardeRequestModel.js";
import Customer from "../Models/CustumerModel.js";
import mongoose from "mongoose";
import cloudinary from "../Utils/cloudinary.js";

export const createCreditUpgrade = asyncHandler(async (req, res) => {
  const { customerId, requestedAmount } = req.body;

  let document = "";

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    document = result.secure_url;
  }

  const newRequest = await CreditUpgrade.create({
    customerId,
    requestedAmount,
    document: document,
  });

  res.status(201).json({
    message: "Credit upgrade request created",
    data: newRequest,
  });
});

export const getAllCreditUpgrades = asyncHandler(async (req, res) => {
  const { customerId } = req.query;

  const filter = {};

  if (customerId) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400);
      throw new Error("Invalid customerId format");
    }
    filter.customerId = customerId;
  }

  const data = await CreditUpgrade.find(filter).populate(
    "customerId",
    "customerName email totalRepayment remainingRepayment einNumber"
  );

  const modifiedData = data.map((item) => {
    const customer = item.customerId;

    let repaymentDonePercent = 0;

    if (customer?.totalRepayment && customer?.remainingRepayment) {
      const total = parseFloat(customer.totalRepayment);
      const remaining = parseFloat(customer.remainingRepayment);

      if (total > 0) {
        repaymentDonePercent = ((total - remaining) / total) * 100;
      }
    }

    return {
      _id: item._id,
      customerId: customer._id,
      einNumber: customer.einNumber,
      customerName: customer.customerName,
      requestedAmount: item.requestedAmount,
      creditUpgradeStatus: item.creditUpgradeStatus,
      document: item.document,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      __v: item.__v,
      repaymentDonePercent: repaymentDonePercent.toFixed(2) + '%',
    };
  });

  res.status(200).json({
    message: customerId
      ? `Credit upgrade requests for customer ${customerId}`
      : "All credit upgrade requests with repayment percent",
    data: modifiedData,
  });
});

// ✅ Get one by ID
export const getCreditUpgradeById = asyncHandler(async (req, res) => {
  const { customerId } = req.query;
  const request = await CreditUpgrade.findById({ customerId: customerId }).populate("customerId");

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  res.status(200).json({ data: request });
});

export const updateCreditUpgradeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { creditUpgradeStatus } = req.body;

  const findRequest = await CreditUpgrade.findById(id);
  if (!findRequest) {
    res.status(404);
    throw new Error("Credit upgrade request not found");
  }

  const updated = await CreditUpgrade.findByIdAndUpdate(
    id,
    { creditUpgradeStatus },
    { new: true }
  );

  if (creditUpgradeStatus === "Approved") {
    const requestedAmount = parseFloat(findRequest.requestedAmount);

    const customer = await Customer.findById(updated.customerId);
    if (!customer) {
      res.status(404);
      throw new Error("Customer not found");
    }

    const currentBalance = parseFloat(customer.availBalance || 0);
    const currentApproved = parseFloat(customer.approvedAmount || 0);
    const currentTotalRepayment = parseFloat(customer.totalRepayment || 0);
    const currentRemainingRepayment = parseFloat(customer.remainingRepayment || 0);

    const factorRate = parseFloat(customer.factorRate);
    const repaymentAmount = requestedAmount * factorRate;

    // Update fields
    customer.availBalance = (currentBalance + requestedAmount).toString();
    customer.approvedAmount = (currentApproved + requestedAmount).toString();
    customer.totalRepayment = (currentTotalRepayment + repaymentAmount).toFixed(2);
    customer.remainingRepayment = (currentRemainingRepayment + repaymentAmount).toFixed(2);
console.log("customer.availBalance",customer.availBalance);
console.log("customer.approvedAmount",customer.approvedAmount);
console.log("customer.totalRepayment",customer.totalRepayment);
console.log("customer.approvedAmount",customer.approvedAmount);
console.log("customer.remainingRepayment",customer.remainingRepayment);


    await customer.save();

    console.log("✅ Customer financials updated");
  }

  res.status(200).json({
    message: "Credit upgrade status updated successfully",
    data: updated,
  });
});



// ✅ Delete request
export const deleteCreditUpgrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await CreditUpgrade.findByIdAndDelete(id);

  if (!deleted) {
    res.status(404);
    throw new Error("Request not found");
  }

  res.status(200).json({ message: "Request deleted" });
});

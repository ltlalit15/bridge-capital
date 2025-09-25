import EarlyPayoff from "../Models/EarlyPayoffManagmentModel.js";
import Custumer from "../Models/CustumerModel.js";
import Repayment from "../Models/RepaymentsModel.js";
import Discount from "../Models/DiscountModel.js";
import asyncHandler from "express-async-handler";
import moment from "moment";

// export const createEarlyPayoffRequest = asyncHandler(async (req, res) => {
//   const { customerId, earlyPayAmount } = req.body;

//   const customer = await Custumer.findById(customerId);
//   if (!customer) {
//     return res.status(404).json({ message: "Customer not found" });
//   }

//   const updatedAt = moment(customer.updatedAt);
//   const today = moment();
//   const daysDifference = today.diff(updatedAt, "days");

//   let discount = 0;
//   if (daysDifference <= 14) {
//     discount = 10;
//   } else if (daysDifference <= 21) {
//     discount = 5;
//   }

//   if (discount === 0) {
//     return res.status(400).json({ message: "Discount not applicable after 21 days." });
//   }
//   const remainingRepayment = parseFloat(customer.remainingRepayment);
//   const discountAmount = (remainingRepayment * discount) / 100;

//   const newRequest = await EarlyPayoff.create({
//     customerId,
//     earlyPayAmount,
//     discount,
//     discountAmount
//   });

//   res.status(201).json({
//     message: "Early payoff request created successfully. Awaiting admin approval.",
//     data: newRequest,
//   });
// });


// export const approveEarlyPayoff = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { earlyPayoffStatus } = req.body;

//   const payoff = await EarlyPayoff.findById(id).populate("customerId");
//   if (!payoff || !payoff.customerId) {
//     return res.status(404).json({ message: "Request or customer not found" });
//   }

//   const customer = payoff.customerId;

//   if (earlyPayoffStatus === "Approved") {
//     const updatedAt = moment(customer.updatedAt);
//     const today = moment();
//     const daysDifference = today.diff(updatedAt, "days");

//     let discount = 0;
//     if (daysDifference <= 14) {
//       discount = 10;
//     } else if (daysDifference <= 21) {
//       discount = 5;
//     }

//     if (discount === 0) {
//       return res.status(400).json({ message: "Discount not applicable after 21 days." });
//     }

//     const remainingRepayment = parseFloat(customer.remainingRepayment);
//     const discountAmount = (remainingRepayment * discount) / 100;
//     const finalPayableAmount = remainingRepayment - discountAmount;

//     if (parseFloat(payoff.earlyPayAmount) !== parseFloat(finalPayableAmount.toFixed(2))) {
//       return res.status(400).json({
//         message: `Early pay amount must be exactly ₹${finalPayableAmount.toFixed(2)} after ${discount}% discount.`,
//       });
//     }

//     // ✅ Update customer financial fields to 0
//     await Custumer.findByIdAndUpdate(customer._id, {
//       approvedAmount: "0",
//       availBalance: "0",
//       installment: "0",
//       remainingRepayment: "0",
//       totalRepayment: "0",
//       factorRate: "0",
//       term_month: "0",
//       term_type: "0",
//       updatedAt: new Date(),
//     });

//     // ✅ Update early payoff with discount details
//     payoff.discount = discount;
//     payoff.discountAmount = discountAmount.toFixed(2);
//   }

//   // ✅ In all cases (Approved/Rejected/Pending), update the status
//   payoff.earlyPayoffStatus = earlyPayoffStatus;
//   await payoff.save();

//   res.status(200).json({
//     message: `Early payoff request ${earlyPayoffStatus.toLowerCase()} successfully.`,
//     data: payoff,
//   });
// });

export const getAllEarlyPayoffs = asyncHandler(async (req, res) => {
  const { id, customerId } = req.query;

  let filter = {};

  if (id) {
    filter._id = id;
  }

  if (customerId) {
    filter.customerId = customerId;
  }

  const allRequests = await EarlyPayoff.find(filter).populate(
    "customerId",
    "customerName email phoneNumber einNumber"
  );

  res.status(200).json({
    message: "Early payoff request(s) fetched",
    data: allRequests,
  });
});

export const createEarlyPayoffRequest = asyncHandler(async (req, res) => {
  const { customerId, earlyPayAmount } = req.body;

  const customer = await Custumer.findById(customerId);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const loanApprovedDate = moment(customer.updatedAt);
  const today = moment();
  const daysSinceApproval = today.diff(loanApprovedDate, 'days');

  const newRequest = await EarlyPayoff.create({
    customerId,
    earlyPayAmount,
    requestDate: daysSinceApproval
  });

  res.status(201).json({
    message: "Early payoff request created successfully. Awaiting admin approval.",
    data: newRequest,
  });
});


export const approveEarlyPayoff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { earlyPayoffStatus, discount, discountAmount } = req.body;

  const payoff = await EarlyPayoff.findByIdAndUpdate(
    id,
    {
      earlyPayoffStatus,
      discount,
      discountAmount,
    },
    { new: true }
  );

  if (!payoff) {
    return res.status(404).json({ message: "Early payoff request not found." });
  }

  let customerId;
  if (earlyPayoffStatus === "approved") {
    customerId = payoff.customerId;

    await Custumer.findByIdAndUpdate(customerId, {
      remainingRepayment: "0.00",
      totalRepayment: "0.00",
    });

    await Discount.updateMany(
      { customerId },
      {
        discountStatus: "Used"
      }
    );
  }

  res.status(200).json({
    message: `Early payoff request ${earlyPayoffStatus.toLowerCase()} successfully.`,
    data: payoff,
  });
});

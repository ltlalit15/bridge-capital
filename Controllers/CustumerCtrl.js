import Customer from "../Models/CustumerModel.js";
import Discount from "../Models/DiscountModel.js";
import Repayment from "../Models/RepaymentsModel.js";
import Withdraw from "../Models/WithdrawModel.js";
import EarlyPayoff from "../Models/EarlyPayoffManagmentModel.js";
import CreditUpgardeRequest from "../Models/CreditUpgardeRequestModel.js";
import Support from "../Models/SupportModel.js";
import Notification from "../Models/NotifiactionModel.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { generateToken } from "../Config/jwtToken.js";
import cloudinary from "../Config/cloudinary.js";
import fs from "fs";
import dayjs from "dayjs";
import moment from "moment";

function calculateLoanEndDate(createdAt, termMonth, termType) {
  let endDate = moment(createdAt);

  // Agar null/undefined hai to empty string kar do
  const safeTermType = (termType || "").toLowerCase();

  switch (safeTermType) {
    case "monthly":
      endDate = endDate.add(termMonth, "months");
      break;
    case "weekly":
      endDate = endDate.add(termMonth, "weeks");
      break;
    case "bi-weekly":
      endDate = endDate.add(termMonth * 2, "weeks");
      break;
    default:
      // agar termType empty string hai ya invalid hai to wahi date return karenge
      return endDate.format("YYYY-MM-DD");
  }

  return endDate.format("YYYY-MM-DD");
}


export const CreateCustumer = asyncHandler(async (req, res) => {
  const {
    customerName,
    companyName,
    email,
    phoneNumber,
    einNumber,
    password
  } = req.body;

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(409).json({ message: "Customer already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const customer = await Customer.create({
    customerName,
    companyName,
    einNumber,
    email,
    phoneNumber,
    password: hashedPassword,
  });

  const Notify = {
    customerId: customer._id,
    message: `New Customer ${customerName} added approve customer docs.`
  };
  await Notification.create(Notify);

  res.status(201).json({
    message: "Customer created successfully ✅",
    customer: {
      id: customer._id,
      customerName: customer.customerName,
      companyName: customer.companyName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      einNumber: customer.einNumber,
      factorRate: customer.factorRate,
      role: customer.role,
    },
  });
});

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
  const token = generateToken(customer._id);
  res.status(200).json({
    message: "Login successful ✅",
    customer: {
      id: customer._id,
      customerName: customer.customerName,
      companyName: customer.companyName,
      email: customer.email,
      einNumber: customer.einNumber,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      factorRate: customer.factorRate,
      role: customer.role,
      token,
    },
  });
});

// export const getCustumers = asyncHandler(async (req, res) => {
//   const { customerId } = req.query;
//   let customers;
//   if (customerId === "6863b2418b8a54cfd7c8e51a") {
//     const allCustomers = await Customer.find({ role: "admin" });
//   } else
//     if (customerId) {
//       customers = await Customer.find({ _id: customerId }).select("-password");
//       const withdraws = await Withdraw.find({ customerId });
//       const approvedWithdraws = withdraws.filter(w => w.withdrawStatus === "Approved");
//       const totalWithdrawAmount = approvedWithdraws.reduce(
//         (acc, t) => acc + parseFloat(t.withdrawAmount || 0),
//         0
//       );
//       const approvedAmount = parseFloat(customers[0]?.approvedAmount || 0);
//       const factorRate = parseFloat(customers[0]?.factorRate || 1);
//       const newPaybackAmount = totalWithdrawAmount * factorRate;
//       customers = customers.map((cust) => {
//         console.log("cust.term_month", cust);
//         const endDate = calculateLoanEndDate(cust.createdAt, parseInt(cust.term_month), cust.term_type);
//         return {
//           ...cust.toObject(),
//           currentAmount: totalWithdrawAmount,
//           NewAmount: newPaybackAmount,
//           loanEndDate: endDate,
//         };
//       });
//     } else {
//       customers = await Customer.find({ role: "customer" }).select("-password");
//     }

//   res.status(200).json({
//     message: "Customers fetched successfully",
//     total: customers.length,
//     customers,
//   });
// });
// export const getCustumers = asyncHandler(async (req, res) => {
//   const { customerId } = req.query;

//   try {
//     let customers = [];

//     // 👉 Case 1: Admin fetch
//     if (customerId === "6863b2418b8a54cfd7c8e51a") {
//       const allCustomers = await Customer.find({ role: "admin" }).select("-password");

//       return res.status(200).json({
//         message: "Admin customers fetched successfully",
//         total: allCustomers.length,
//         customers: allCustomers,
//       });
//     }

//     // 👉 Case 2: Specific customer with ID
//     if (customerId) {
//       customers = await Customer.find({ _id: customerId }).select("-password");

//       if (!customers.length) {
//         return res.status(404).json({ message: "Customer not found", success: false });
//       }

//       const withdraws = await Withdraw.find({ customerId });
//       const approvedWithdraws = withdraws.filter(w => w.withdrawStatus === "Approved");

//       const totalWithdrawAmount = approvedWithdraws.reduce(
//         (acc, t) => acc + parseFloat(t.withdrawAmount || 0),
//         0
//       );

//       const approvedAmount = parseFloat(customers[0]?.approvedAmount || 0);
//       const factorRate = parseFloat(customers[0]?.factorRate || 1);
//       const newPaybackAmount = totalWithdrawAmount * factorRate;

//       customers = customers.map((cust) => {
//         const endDate = calculateLoanEndDate(
//           cust.createdAt,
//           parseInt(cust.term_month),
//           cust.term_type
//         );

//         return {
//           ...cust.toObject(),
//           currentAmount: totalWithdrawAmount,
//           NewAmount: newPaybackAmount,
//           loanEndDate: endDate,
//         };
//       });

//       return res.status(200).json({
//         message: "Customer fetched successfully",
//         total: customers.length,
//         customers,
//       });
//     }

//     // 👉 Case 3: Get all customers with role "customer"
//     customers = await Customer.find({ role: "customer" }).select("-password");

//     res.status(200).json({
//       message: "Customers fetched successfully",
//       total: customers.length,
//       customers,
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message, success: false });
//   }
// });
export const getCustumers = asyncHandler(async (req, res) => {
  const { customerId } = req.query;

  try {
    let customers = [];

    // 👉 Case 1: Admin fetch
    if (customerId === "6863b2418b8a54cfd7c8e51a") {
      const allCustomers = await Customer.find({ role: "admin" }).select("-password");

      return res.status(200).json({
        message: "Admin customers fetched successfully",
        total: allCustomers.length,
        customers: allCustomers,
      });
    }

    // 👉 Case 2: Specific customer with ID
    if (customerId) {
      customers = await Customer.find({ _id: customerId }).select("-password");

      if (!customers.length) {
        return res.status(404).json({ message: "Customer not found", success: false });
      }

      const customer = customers[0];

      // ✅ First Payment Status Logic
      let firstPaymentStatus = "inComplete";
      const withdrawals = await Withdraw.find({ customerId: customer._id });

      // Agar koi bhi withdrawal approved hai to status "Complete" ho jayega
      if (withdrawals.some(w => w.withdrawStatus === "Approved")) {
        firstPaymentStatus = "Complete";
      }

      let totalWithdrawAmount = 0;
      let approvedCreditLine = parseFloat(customer.approvedAmount || 0);
      let minimumWithdrawal = false;

      if (withdrawals.length > 0) {
        withdrawals.forEach((withdraw) => {
          totalWithdrawAmount += parseFloat(withdraw.withdrawAmount || 0);
          if (!approvedCreditLine && withdraw.approvedCreditLine) {
            approvedCreditLine = parseFloat(withdraw.approvedCreditLine);
          }
        });

        const tenPercent = approvedCreditLine * 0.10;
        minimumWithdrawal = totalWithdrawAmount >= tenPercent;
      }

      // Credit Increase Eligibility Logic
      let creditIncrease = false;
      if (customer.totalRepayment && customer.remainingRepayment && approvedCreditLine > 0) {
        const remainingPercent = (customer.remainingRepayment / customer.totalRepayment) * 100;
        const totalWithdrawAmountData = customer.totalRepayment - customer.remainingRepayment;
        const withdrawPercent = (totalWithdrawAmountData / approvedCreditLine) * 100;

        if (remainingPercent <= 50 && withdrawPercent >= 50) {
          creditIncrease = true;
        }
      }

      const factorRate = parseFloat(customer.factorRate || 1);
      const newPaybackAmount = totalWithdrawAmount * factorRate;

      const endDate = calculateLoanEndDate(customer.createdAt, parseInt(customer.term_month), customer.term_type);

      customers = [{
        ...customer.toObject(),
        currentAmount: totalWithdrawAmount,
        NewAmount: newPaybackAmount,
        loanEndDate: endDate,
        minimumWithdrawal,
        creditIncrease,
        firstPaymentStatus
      }];

      return res.status(200).json({
        message: "Customer fetched successfully",
        total: customers.length,
        customers,
      });
    }

    // 👉 Case 3: Get all customers with role "customer"
    customers = await Customer.find({ role: "customer" }).select("-password");

    res.status(200).json({
      message: "Customers fetched successfully",
      total: customers.length,
      customers,
    });

  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});


export const UpdateCustumerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customerStatus } = req.body;
  const updatedCustomer = await Customer.findByIdAndUpdate(
    id,
    { customerStatus },
    { new: true, runValidators: true }
  ).select("-password");
  if (!updatedCustomer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.status(200).json({
    message: "Customer status updated successfully ✅",
    customerId: updatedCustomer._id,
    updatedStatus: updatedCustomer.customerStatus,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    customerName, companyName, email, einNumber, phoneNumber,
    approvedAmount, totalRepayment, term_month, installment,
    factorRate, availBalance, term_type, originalFee
  } = req.body;
  const customer = await Customer.findById(id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found ❌");
  }
  customer.customerName = customerName || customer.customerName;
  customer.companyName = companyName || customer.companyName;
  customer.email = email || customer.email;
  customer.phoneNumber = phoneNumber || customer.phoneNumber;
  customer.factorRate = factorRate || customer.factorRate;
  customer.term_type = term_type || customer.term_type;
  customer.approvedAmount = approvedAmount || customer.approvedAmount;
  customer.totalRepayment = totalRepayment || customer.totalRepayment;
  customer.term_month = term_month || customer.term_month;
  customer.einNumber = einNumber || customer.einNumber;
  customer.originalFee = originalFee || customer.originalFee;
  customer.availBalance = availBalance || customer.availBalance;
  customer.installment = installment || customer.installment;
  if (totalRepayment !== undefined) {
    customer.remainingRepayment = totalRepayment;
  }
  const updatedCustomer = await customer.save();
  res.status(200).json({
    message: "Customer updated successfully ✅",
    customer: {
      id: updatedCustomer._id,
      customerName: updatedCustomer.customerName,
      companyName: updatedCustomer.companyName,
      email: updatedCustomer.email,
      phoneNumber: updatedCustomer.phoneNumber,
      factorRate: updatedCustomer.factorRate,
      approvedAmount: updatedCustomer.approvedAmount,
      totalRepayment: updatedCustomer.totalRepayment,
      term_month: updatedCustomer.term_month,
      installment: updatedCustomer.installment,
      einNumber: updatedCustomer.einNumber,
      originalFee: updatedCustomer.originalFee,
      availBalance: updatedCustomer.availBalance,
      remainingRepayment: updatedCustomer.remainingRepayment,
      term_type: updatedCustomer.term_type,
    },
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedCustomer = await Customer.findByIdAndDelete(id);
  if (!deletedCustomer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  await Repayment.deleteMany({ customerId: id });
  await Withdraw.deleteMany({ customerId: id });
  await Notification.deleteMany({ customerId: id });
  await Support.deleteMany({ customerId: id });
  await CreditUpgardeRequest.deleteMany({ customerId: id });
  await Discount.deleteMany({ customerId: id });
  await EarlyPayoff.deleteMany({ customerId: id });
  res.status(200).json({
    message: "Customer deleted successfully",
    customerId: deletedCustomer._id,
  });
});

export const getCustomerNames = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ role: "customer" }, { customerName: 1 });
  const customerList = customers.map(customer => ({
    id: customer._id,
    name: customer.customerName
  }));
  res.status(200).json({
    msg: "Successfully fetched All Customer",
    total: customerList.length,
    customers: customerList
  });
});

export const autoDeductInstallments = asyncHandler(async (req, res) => {
  try {
    const customers = await Customer.find({ role: "customer" });
    const now = dayjs();
    let updatedCount = 0;
    let logs = [];

    for (const customer of customers) {
      const {
        _id, customerName, remainingRepayment,
        installment, term_type, updatedAt
      } = customer;

      const lastUpdated = dayjs(updatedAt);
      let nextDueDate;

      const type = term_type?.toLowerCase().replace(/-/g, "") || null;
      if (type === "monthly") {
        nextDueDate = lastUpdated.add(1, 'month');
      } else if (type === "weekly") {
        nextDueDate = lastUpdated.add(1, 'week');
      } else if (type === "biweekly") {
        nextDueDate = lastUpdated.add(2, 'week');
      } else {
        logs.push({ customerId: _id, customerName, message: "Invalid term_type" });
        continue;
      }

      if (now.isSame(nextDueDate, 'day')) {
        const newRemaining = parseFloat(remainingRepayment) - parseFloat(installment);
        await Customer.findByIdAndUpdate(_id, {
          remainingRepayment: newRemaining > 0 ? newRemaining : 0,
          lastInstallmentDate: now.toDate(),
        });

        await Notification.create({
          message: `Installment of $${installment} deducted.`,
          customerId: _id
        });

        updatedCount++;
        logs.push({
          customerId: _id,
          customerName,
          message: `Installment of $${installment} deducted.`
        });
      } else {
        logs.push({
          customerId: _id,
          customerName,
          message: `No payment due today. Next due on ${nextDueDate.format("YYYY-MM-DD")}`
        });
      }
    }

    res.status(200).json({
      message: `Installments processed for ${updatedCount} customer(s).`,
      logs,
    });

  } catch (error) {
    console.error("Auto Deduction Error:", error);
    res.status(500).json({ message: "Server error while processing auto deduction" });
  }
});
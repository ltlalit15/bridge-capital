import Customer from "../Models/CustumerModel.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { generateToken } from "../Config/jwtToken.js";
import crypto from "crypto";
import Withdraw from "../Models/WithdrawModel.js"
import transporter from "../Utils/Nodemailer.js";

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

  // 🔐 Generate reset token
  const token = crypto.randomBytes(20).toString("hex");
  customer.resetToken = token;
  customer.resetTokenExpiry = Date.now() + 3600000;
  await customer.save();

  const resetLink = `https://ladybugs.netlify.app/reset-password/${token}`;

  const htmlContent = `
  <html>
    <body>
     <div
  style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #e6f7ec;
  color: #333;
  font-size: 15px;
  padding: 40px 16px;">
  
  <div style="max-width: 600px; margin: auto; background-color: #ccf8db; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden">
    <div style="text-align: center; background-color: #2b9348; padding: 24px">
      <img src="https://i.ibb.co/1x1Gvdk/Original-Body-R.jpg" alt="logo" height="45" style="vertical-align: middle; border-radius: 6px;" />
    </div>

    <div style="padding: 32px 24px">
      <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 22px; color: #2b9348">
        🔐 Password Reset Request
      </h2>

      <p style="margin-bottom: 20px">
        We received a request to reset the password for your Ladybug Lending® account. Click the button below to set a new password:
      </p>

      <p style="text-align: center; margin: 30px 0">
        <a
          href="${resetLink}"
          style="background-color: #2b9348; color: #ffffff; padding: 14px 24px; border-radius: 6px;
          text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px;">
          Reset Your Password
        </a>
      </p>

      <p style="margin-bottom: 20px; text-align: center; color: #555;">
        This link will expire in <strong>1 hour</strong>.
      </p>

      <p style="margin-bottom: 0; color: #666">
        If you did not request this password reset, you can safely ignore this email. Your account will remain secure.
      </p>

      <p style="margin-top: 30px; color: #2b9348;">
        Regards,<br />
        <strong>Ladybug Lending® Team</strong>
      </p>
    </div>
  </div>

  <div style="max-width: 600px; margin: 20px auto; text-align: center; color: #777; font-size: 13px">
    <p style="margin: 0">
      This email was sent to <strong>${customer.email}</strong><br />
      You received this email because your email is registered with <strong>Ladybug Lending®</strong>.
    </p>
  </div>
</div>
    </body>
  </html>
  `;

  const mailOptions = {
    from: '"Ladybug Lending" <your-email@gmail.com>',
    to: email,
    subject: '🔐 Password Reset Request - Ladybug Lending',
    html: htmlContent,
  };

  try {
    const sendData = await transporter.sendMail(mailOptions);
    // console.log("Nodemailer Response:", sendData);
    res.status(200).json({ message: "Reset email sent successfully",token });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ message: "Failed to send reset email" });
  }
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


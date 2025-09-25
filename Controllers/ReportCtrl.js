import Repayment from "../Models/RepaymentsModel.js";
import Withdraw from "../Models/WithdrawModel.js";
import asyncHandler from "express-async-handler";

export const getReport = asyncHandler(async (req, res) => {
  const { customerId, reportType, startDate, endDate } = req.query;

  let dateFilter = {};

  if (startDate || endDate) {
    dateFilter.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.createdAt.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = end;
    }
  }

  let customerFilter = {};
  if (customerId) {
    customerFilter.customerId = customerId;
  }

  const filters = {
    ...customerFilter,
    ...dateFilter,
  };

  let result;

  switch (reportType) {
    case "DrawHistory":
      filters.withdrawStatus = "Approved";
      result = await Withdraw.find(filters).sort({ createdAt: -1 });
      break;

    case "RepaymentLogs":
      result = await Repayment.find(filters).sort({ createdAt: -1 });
      break;

    case "FundingRequest":
      result = await Withdraw.find(filters).sort({ createdAt: -1 });
      break;

    default:
      return res.status(400).json({ message: "Invalid report type." });
  }

  res.status(200).json({
    message: `${reportType} fetched successfully`,
    count: result.length,
    data: result,
  });
});

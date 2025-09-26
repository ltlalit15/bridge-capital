import LoanApplication from "../Models/LoanApplicationModel.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// Create a new loan application
export const createLoanApplication = async (req, res) => {
  try {
    const { customerId, loan_amount, loan_purpose, loan_tenure, monthly_income } = req.body;

    let documents = [];

    // ✅ Upload files to Cloudinary if they exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "loan_applications", // keep all loan docs in one folder
          resource_type: "auto"
        });

        documents.push({
          name: file.originalname,
          url: uploadResult.secure_url
        });

        // cleanup temp file
        fs.unlinkSync(file.path);
      }
    }

    const newApplication = new LoanApplication({
      customerId,
      loan_amount,
      loan_purpose,
      loan_tenure,
      monthly_income,
      documents
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Loan application submitted",
      data: newApplication
    });
  } catch (error) {
    console.error("Error creating loan application:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get all loan applications (optional, for admin)
export const getAllLoanApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find().populate('customerId', 'customerName email');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getLoanApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await LoanApplication.findById(id).populate('customerId', 'customerName email');

    if (!application) {
      return res.status(404).json({ success: false, message: "Loan application not found" });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("Error fetching loan application:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Get single customer loan applications
export const getCustomerApplications = async (req, res) => {
  try {
    const { customerId } = req.params;
    const applications = await LoanApplication.find({ customerId }).populate('customerId', 'customerName email');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching customer applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteLoanApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await LoanApplication.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Loan application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Loan application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting loan application:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
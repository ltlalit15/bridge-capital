import LoanApplication from "../Models/LoanApplicationModel.js";
import cloudinary from "../Utils/cloudinary.js";
import fs from "fs";

// Create a new loan application
// Create a new loan application
export const createLoanApplication = async (req, res) => {
  try {
    const { customerId, loan_amount, loan_purpose, loan_tenure, monthly_income } = req.body;

    let documents = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "loan_applications",
          resource_type: "auto"
        });

        documents.push(uploadResult.secure_url);  // ✅ only URL

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

// controllers/LoanApplicationCtrl.js
export const updateLoanApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Fields that can be updated
    const { loan_amount, loan_purpose, loan_tenure, monthly_income } = req.body;

    let updateData = {
      loan_amount,
      loan_purpose,
      loan_tenure,
      monthly_income
    };

    // Remove undefined values (only update provided fields)
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // ✅ Handle new file uploads if provided
    if (req.files && req.files.length > 0) {
      let documents = [];
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "loan_applications",
          resource_type: "auto"
        });

        documents.push({
         
          url: uploadResult.secure_url
        });

        fs.unlinkSync(file.path); // cleanup temp file
      }

      updateData.$push = { documents: { $each: documents } };
      // → pushes new docs instead of replacing existing ones
    }

    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("customerId", "customerName email");

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan application updated successfully",
      data: updatedApplication
    });
  } catch (error) {
    console.error("Error updating loan application:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/LoanApplicationCtrl.js
export const updateLoanApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // validate status
    // const allowedStatuses = ["pending", "approved", "rejected"];
    // if (!allowedStatuses.includes(status)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
    //   });
    // }

    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("customerId", "customerName email");

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan application status updated",
      data: updatedApplication
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

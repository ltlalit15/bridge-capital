import Contact from "../Models/SupportModel.js";
import asyncHandler from "express-async-handler";

export const createContact = asyncHandler(async (req, res) => {
  const { customerId, subject, message } = req.body;

  const newContact = await Contact.create({ customerId, subject, message });
  res.status(201).json({ message: "Contact saved", data: newContact });
});

export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().populate('customerId');

  const formatted = contacts.map((item) => ({
    customerId: item.customerId?._id,
    _id: item?._id,
    customerName: item.customerId?.customerName,
    einNumber: item.customerId?.einNumber,
    companyName: item.customerId?.companyName,
    email: item.customerId?.email,
    phoneNumber: item.customerId?.phoneNumber,
    subject: item.subject,
    message: item.message,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  res.status(200).json({ data: formatted });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Contact.findByIdAndDelete(id);
  if (!deleted) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json({ message: "Contact deleted" });
});

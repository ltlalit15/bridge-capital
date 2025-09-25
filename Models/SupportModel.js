import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },    subject: { type: String },
    message: { type: String },
}, {
    timestamps: true
});

export default mongoose.model("Contact", contactSchema);

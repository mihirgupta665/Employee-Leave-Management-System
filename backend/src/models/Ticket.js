import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "complaint_against_manager",
        "leave_issue",
        "payroll_issue",
        "policy_question",
        "technical_support",
        "other"
      ],
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open"
    },
    adminReply: { type: String, default: "" },
    repliedByAdminId: { type: mongoose.Schema.Types.ObjectId, default: null },
    repliedByAdminName: { type: String, default: "" },
    repliedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;

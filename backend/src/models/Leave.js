import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "earned"],
      required: true
    },
    fromDate: {
      type: Date,
      required: true
    },
    toDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending"
    },
    reviewedById: { type: mongoose.Schema.Types.ObjectId, default: null },
    reviewedByName: { type: String, default: "" },
    managerComment: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;

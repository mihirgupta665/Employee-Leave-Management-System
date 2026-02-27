import Leave from "../models/Leave.js";

const PENDING_EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;

const expireStalePendingLeaves = async (employeeId = null) => {
  const filter = {
    status: "pending",
    createdAt: { $lt: new Date(Date.now() - PENDING_EXPIRY_MS) }
  };

  if (employeeId) {
    filter.employeeId = employeeId;
  }

  await Leave.updateMany(filter, {
    $set: {
      status: "expired"
    }
  });
};

const createLeave = async (req, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;

  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (start > end) {
    return res.status(400).json({ message: "fromDate must be before toDate" });
  }

  await expireStalePendingLeaves(req.user._id);

  const existingPending = await Leave.findOne({ employeeId: req.user._id, status: "pending" });
  if (existingPending) {
    return res.status(400).json({
      message: "You already have a pending leave request. Please wait for review or expiry after 2 days."
    });
  }

  const leave = await Leave.create({
    employeeId: req.user._id,
    employeeName: req.user.name,
    employeeEmail: req.user.email,
    leaveType,
    fromDate,
    toDate,
    reason
  });

  res.status(201).json({
    message: "Leave request submitted",
    leave
  });
};

const getMyLeaves = async (req, res) => {
  await expireStalePendingLeaves(req.user._id);
  const leaves = await Leave.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
  res.json({ leaves });
};

const getMyLeaveSummary = async (req, res) => {
  await expireStalePendingLeaves(req.user._id);
  const [pending, approved, rejected] = await Promise.all([
    Leave.countDocuments({ employeeId: req.user._id, status: "pending" }),
    Leave.countDocuments({ employeeId: req.user._id, status: "approved" }),
    Leave.countDocuments({ employeeId: req.user._id, status: "rejected" })
  ]);

  res.json({
    summary: { pending, approved, rejected }
  });
};

const getReviewQueue = async (req, res) => {
  await expireStalePendingLeaves();
  const leaves = await Leave.find({ status: "pending" }).sort({ createdAt: -1 });

  res.json({ leaves });
};

const getManagerAnalytics = async (_req, res) => {
  const [pending, approved, rejected, requests] = await Promise.all([
    Leave.countDocuments({ status: "pending" }),
    Leave.countDocuments({ status: "approved" }),
    Leave.countDocuments({ status: "rejected" }),
    Leave.find({}, "status createdAt").sort({ createdAt: -1 })
  ]);

  res.json({
    summary: { pending, approved, rejected },
    requests: requests.map((leave) => ({
      id: leave._id,
      status: leave.status,
      createdAt: leave.createdAt
    }))
  });
};

const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status, managerComment } = req.body;

  await expireStalePendingLeaves();

  const leave = await Leave.findById(id);
  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  if (leave.status !== "pending") {
    const message =
      leave.status === "expired" ? "Leave request expired after 2 days and can no longer be reviewed." : "Leave already reviewed";
    return res.status(400).json({ message });
  }

  leave.status = status;
  leave.managerComment = managerComment || "";
  leave.reviewedById = req.user._id;
  leave.reviewedByName = req.user.name;
  await leave.save();

  res.json({
    message: `Leave ${status}`,
    leave
  });
};

export {
  createLeave,
  getMyLeaves,
  getMyLeaveSummary,
  getReviewQueue,
  getManagerAnalytics,
  updateLeaveStatus
};

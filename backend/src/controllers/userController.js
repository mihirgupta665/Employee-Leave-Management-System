import { modelByRole, roleOrder } from "../utils/roleModels.js";
import Leave from "../models/Leave.js";

const listUsers = async (_req, res) => {
  const [admins, managers, employees] = await Promise.all([
    modelByRole.admin.find().select("-password").sort({ createdAt: -1 }),
    modelByRole.manager.find().select("-password").sort({ createdAt: -1 }),
    modelByRole.employee.find().select("-password").sort({ createdAt: -1 })
  ]);

  const users = [...admins, ...managers, ...employees].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ users });
};

const createUserByAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  for (const currentRole of roleOrder) {
    const exists = await modelByRole[currentRole].findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }
  }

  const UserModel = modelByRole[role];
  const user = await UserModel.create({ name, email, password, role });
  res.status(201).json({
    message: "User created",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === String(req.user._id)) {
    return res.status(400).json({ message: "Admin cannot delete self" });
  }

  let user = null;
  for (const currentRole of roleOrder) {
    user = await modelByRole[currentRole].findById(id);
    if (user) break;
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
};

const getAnalytics = async (_req, res) => {
  const [admins, managers, employees, totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves] =
    await Promise.all([
      modelByRole.admin.countDocuments(),
      modelByRole.manager.countDocuments(),
      modelByRole.employee.countDocuments(),
      Leave.countDocuments(),
      Leave.countDocuments({ status: "pending" }),
      Leave.countDocuments({ status: "approved" }),
      Leave.countDocuments({ status: "rejected" })
    ]);

  const totalUsers = admins + managers + employees;
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString("en-US", { month: "short" }),
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1)
    });
  }

  const monthlyUsers = await Promise.all(
    months.map(async (month) => {
      const [a, m, e] = await Promise.all([
        modelByRole.admin.countDocuments({ createdAt: { $gte: month.start, $lt: month.end } }),
        modelByRole.manager.countDocuments({ createdAt: { $gte: month.start, $lt: month.end } }),
        modelByRole.employee.countDocuments({ createdAt: { $gte: month.start, $lt: month.end } })
      ]);
      return { month: month.label, total: a + m + e };
    })
  );

  res.json({
    totals: { totalUsers, admins, managers, employees },
    leaves: {
      total: totalLeaves,
      pending: pendingLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves
    },
    monthlyUsers
  });
};

export { listUsers, createUserByAdmin, deleteUser, getAnalytics };

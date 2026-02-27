import Ticket from "../models/Ticket.js";

const createTicket = async (req, res) => {
  const { category, priority, subject, description } = req.body;

  const ticket = await Ticket.create({
    employeeId: req.user._id,
    employeeName: req.user.name,
    employeeEmail: req.user.email,
    category,
    priority: priority || "medium",
    subject,
    description
  });

  res.status(201).json({
    message: "Support ticket raised successfully",
    ticket
  });
};

const getMyTickets = async (req, res) => {
  const tickets = await Ticket.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
  res.json({ tickets });
};

const getAllTicketsForAdmin = async (req, res) => {
  const { status, category } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  res.json({ tickets });
};

const replyToTicket = async (req, res) => {
  const { id } = req.params;
  const { adminReply, status } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  ticket.adminReply = adminReply;
  ticket.status = status;
  ticket.repliedByAdminId = req.user._id;
  ticket.repliedByAdminName = req.user.name;
  ticket.repliedAt = new Date();
  await ticket.save();

  res.json({
    message: "Ticket updated successfully",
    ticket
  });
};

export { createTicket, getMyTickets, getAllTicketsForAdmin, replyToTicket };

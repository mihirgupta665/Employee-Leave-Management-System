import { body } from "express-validator";

const createTicketValidator = [
  body("category")
    .isIn([
      "complaint_against_manager",
      "leave_issue",
      "payroll_issue",
      "policy_question",
      "technical_support",
      "other"
    ])
    .withMessage("Invalid category"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  body("subject")
    .trim()
    .isLength({ min: 4, max: 120 })
    .withMessage("Subject must be between 4 and 120 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1500 })
    .withMessage("Description must be between 10 and 1500 characters")
];

const replyTicketValidator = [
  body("status")
    .isIn(["open", "in_progress", "resolved", "closed"])
    .withMessage("Invalid status"),
  body("adminReply")
    .trim()
    .isLength({ min: 2, max: 1500 })
    .withMessage("Admin reply must be between 2 and 1500 characters")
];

export { createTicketValidator, replyTicketValidator };

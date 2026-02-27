import { body } from "express-validator";

const createLeaveValidator = [
  body("leaveType")
    .isIn(["sick", "casual", "earned"])
    .withMessage("Invalid leave type"),
  body("fromDate").isISO8601().withMessage("fromDate must be a valid date"),
  body("toDate").isISO8601().withMessage("toDate must be a valid date"),
  body("reason")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Reason must be at least 5 characters")
];

const updateLeaveStatusValidator = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected"),
  body("managerComment")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("managerComment must be under 500 characters")
];

export { createLeaveValidator, updateLeaveStatusValidator };

import { body } from "express-validator";

const createUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "manager", "employee"])
    .withMessage("Role is invalid")
];

const updateRoleValidator = [
  body("role")
    .isIn(["admin", "manager", "employee"])
    .withMessage("Role is invalid")
];

export { createUserValidator, updateRoleValidator };

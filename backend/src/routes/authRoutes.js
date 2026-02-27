import express from "express";
import { getMe, login, register } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { loginValidator, registerValidator } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", registerValidator, validateRequest, asyncHandler(register));
router.post("/login", loginValidator, validateRequest, asyncHandler(login));
router.get("/me", protect, asyncHandler(getMe));

router.post(
  "/register-by-admin",
  protect,
  authorizeRoles("admin"),
  registerValidator,
  validateRequest,
  asyncHandler(register)
);

export default router;

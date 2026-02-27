import express from "express";
import {
  createUserByAdmin,
  deleteUser,
  getAnalytics,
  listUsers
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserValidator } from "../validators/userValidators.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));
router.get("/", asyncHandler(listUsers));
router.get("/analytics", asyncHandler(getAnalytics));
router.post("/", createUserValidator, validateRequest, asyncHandler(createUserByAdmin));
router.delete("/:id", asyncHandler(deleteUser));

export default router;

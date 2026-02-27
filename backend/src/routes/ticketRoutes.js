import express from "express";
import {
  createTicket,
  getAllTicketsForAdmin,
  getMyTickets,
  replyToTicket
} from "../controllers/ticketController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { createTicketValidator, replyTicketValidator } from "../validators/ticketValidators.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("employee"),
  createTicketValidator,
  validateRequest,
  asyncHandler(createTicket)
);

router.get("/my", protect, authorizeRoles("employee"), asyncHandler(getMyTickets));

router.get("/", protect, authorizeRoles("admin"), asyncHandler(getAllTicketsForAdmin));

router.patch(
  "/:id/reply",
  protect,
  authorizeRoles("admin"),
  replyTicketValidator,
  validateRequest,
  asyncHandler(replyToTicket)
);

export default router;

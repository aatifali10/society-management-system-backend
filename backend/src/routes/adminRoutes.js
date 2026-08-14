import express from "express";
import {
  getAdminDashboard,
  getResidents,
  getBillingSummary,
  applyLatePenalty,
  getHelpdeskTickets,
  updateTicketStatus,
  createNotice,
  getGateLogs,
} from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("admin"),
  getAdminDashboard,
);
router.get("/residents", authenticate, authorizeRoles("admin"), getResidents);
router.get(
  "/billing",
  authenticate,
  authorizeRoles("admin"),
  getBillingSummary,
);
router.post(
  "/billing/penalty",
  authenticate,
  authorizeRoles("admin"),
  applyLatePenalty,
);
router.get(
  "/helpdesk",
  authenticate,
  authorizeRoles("admin"),
  getHelpdeskTickets,
);
router.patch(
  "/helpdesk/:ticketId/status",
  authenticate,
  authorizeRoles("admin"),
  updateTicketStatus,
);
router.post("/notice", authenticate, authorizeRoles("admin"), createNotice);
router.get("/gate-logs", authenticate, authorizeRoles("admin"), getGateLogs);

export default router;

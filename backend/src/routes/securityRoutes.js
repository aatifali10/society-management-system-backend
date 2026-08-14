import express from "express";
import {
  getSecurityDashboard,
  createVisitorLog,
  verifyGatePass,
  getSecurityAlerts,
  getSecurityLogs,
} from "../controllers/securityController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("security", "admin"),
  getSecurityDashboard,
);
router.post(
  "/visitor-log",
  authenticate,
  authorizeRoles("security", "admin"),
  createVisitorLog,
);
router.post(
  "/verify-pass",
  authenticate,
  authorizeRoles("security", "admin"),
  verifyGatePass,
);
router.get(
  "/alerts",
  authenticate,
  authorizeRoles("security", "admin"),
  getSecurityAlerts,
);
router.get(
  "/logs",
  authenticate,
  authorizeRoles("security", "admin"),
  getSecurityLogs,
);

export default router;

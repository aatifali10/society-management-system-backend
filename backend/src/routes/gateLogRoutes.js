import express from "express";
import {
  logVisitorEntry,
  logVisitorExit,
  getActiveVisitors,
  getGateLogs,
  getTodayLogs,
  getSecurityAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAllGateLogs,
} from "../controllers/gateLogController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Guard", "Admin"]));

router.post("/entry", logVisitorEntry);
router.patch("/:logId/exit", logVisitorExit);
router.get("/active-visitors", getActiveVisitors);
router.get("/logs", getGateLogs);
router.get("/today-logs", getTodayLogs);
router.get("/alerts", getSecurityAlerts);
router.patch("/alert/:id/acknowledge", acknowledgeAlert);
router.patch("/alert/:id/resolve", resolveAlert);

router.get("/admin/all-logs", roleMiddleware(["Admin"]), getAllGateLogs);

export default router;

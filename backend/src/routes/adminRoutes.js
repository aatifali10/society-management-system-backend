import express from "express";
import {
  createFlat,
  onboardResident,
  generateBills,
  broadcastNotice,
  getResidents,
  getComplaints,
  assignComplaint,
  updateComplaintStatus,
  getBillingReport,
  applyPenalty,
  getDashboard,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Admin"]));

router.get("/dashboard", getDashboard);

router.post("/flat", createFlat);

router.get("/residents", getResidents);
router.post("/resident", onboardResident);

router.get("/billing", getBillingReport);
router.post("/bills", generateBills);
router.patch("/billing/:billId/penalty", applyPenalty);

router.get("/helpdesk", getComplaints);
router.patch("/helpdesk/:complaintId/assign", assignComplaint);
router.patch("/helpdesk/:complaintId/status", updateComplaintStatus);

router.post("/notice", broadcastNotice);

export default router;

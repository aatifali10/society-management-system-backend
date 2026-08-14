import express from "express";
import {
  getResidentDashboard,
  getProfile,
  updateProfile,
  getBills,
  payBill,
  createVisitorPass,
  getVisitorPasses,
  createComplaint,
  updateComplaintStatus,
  getComplaints,
  getAmenities,
  createAmenityBooking,
  getNotices,
  getPolls,
  votePoll,
} from "../controllers/residentController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("resident"),
  getResidentDashboard,
);
router.get("/profile", authenticate, authorizeRoles("resident"), getProfile);
router.put("/profile", authenticate, authorizeRoles("resident"), updateProfile);
router.get("/bills", authenticate, authorizeRoles("resident"), getBills);
router.post(
  "/bills/:billId/pay",
  authenticate,
  authorizeRoles("resident"),
  payBill,
);
router.post(
  "/visitor-pass",
  authenticate,
  authorizeRoles("resident"),
  createVisitorPass,
);
router.get(
  "/visitor-passes",
  authenticate,
  authorizeRoles("resident"),
  getVisitorPasses,
);
router.post(
  "/complaint",
  authenticate,
  authorizeRoles("resident"),
  createComplaint,
);
router.patch(
  "/complaints/:complaintId/status",
  authenticate,
  authorizeRoles("resident"),
  updateComplaintStatus,
);
router.get(
  "/complaints",
  authenticate,
  authorizeRoles("resident"),
  getComplaints,
);
router.get(
  "/amenities",
  authenticate,
  authorizeRoles("resident"),
  getAmenities,
);
router.post(
  "/amenity-booking",
  authenticate,
  authorizeRoles("resident"),
  createAmenityBooking,
);
router.get("/notices", authenticate, authorizeRoles("resident"), getNotices);
router.get("/polls", authenticate, authorizeRoles("resident"), getPolls);
router.post(
  "/polls/:pollId/vote",
  authenticate,
  authorizeRoles("resident"),
  votePoll,
);

export default router;

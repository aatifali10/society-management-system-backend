import express from "express";

import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  addComment,
  rateComplaint,
  getComplaintStats,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/auth.js";

const complaintRouter = express.Router();
complaintRouter.use(protect);

complaintRouter.post("/", createComplaint);
complaintRouter.get("/", getComplaints);
complaintRouter.get("/stats", getComplaintStats);
complaintRouter.get("/:id", getComplaintById);
complaintRouter.put("/:id", updateComplaint);
complaintRouter.post("/:id/comments", addComment);
complaintRouter.put("/:id/rate", rateComplaint);

export default complaintRouter;

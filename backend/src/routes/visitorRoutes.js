import express from "express";
import {
  createVisitor,
  getVisitors,
  getVisitorById,
  updateVisitorStatus,
  getVisitorQR,
  getVisitorStats,
} from "../controllers/visitorController.js";
import { protect } from "../middleware/auth.js";
import { Visitor } from "../models/Visitor.js";

const visitorRouter = express.Router();

visitorRouter.use(protect);

visitorRouter.post("/", createVisitor);
visitorRouter.get("/", getVisitors);
visitorRouter.get("/stats", getVisitorStats);
visitorRouter.get("/:id", getVisitorById);
visitorRouter.get("/:id/qr", getVisitorQR);
visitorRouter.put("/:id/status", updateVisitorStatus);

export default VisitorRouter;

import express from "express";
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  unpublishNotice,
  getNoticeStats,
} from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/auth.js";

const noticeRouter = express.Router();
noticeRouter.use(protect);

noticeRouter.get("/", getNotices);
noticeRouter.get("/stats", authorize("admin"), getNoticeStats);
noticeRouter.get("/:id", getNoticeById);
noticeRouter.post("/", authorize("admin"), createNotice);
noticeRouter.put("/:id", authorize("admin"), updateNotice);
noticeRouter.delete("/:id", authorize("admin"), deleteNotice);
noticeRouter.put("/:id/publish", authorize("admin"), publishNotice);
noticeRouter.put("/:id/unpublish", authorize("admin"), unpublishNotice);

export default noticeRouter;

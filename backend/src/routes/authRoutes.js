import express from "express";
import {
  login,
  register,
  getProfile,
  updateProfile,
  verifyMfa,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-mfa", verifyMfa);
router.get("/me", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/logout", authenticate, logout);

export default router;

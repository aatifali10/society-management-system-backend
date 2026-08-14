import express from "express";
import {
  getAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
  checkAvailability,
  bookAmenity,
  getUserBookings,
  cancelBooking,
} from "../controllers/amenityController.js";
import { protect, authorize } from "../middleware/auth.js";

const amenityRouter = express.Router();
amenityRouter.use(protect);

amenityRouter.get("/", getAmenities);
amenityRouter.get("/bookings", getUserBookings);
amenityRouter.get("/:id", getAmenityById);
amenityRouter.get("/:id/availability", checkAvailability);
amenityRouter.post("/", authorize("admin"), createAmenity);
amenityRouter.put("/:id", authorize("admin"), updateAmenity);
amenityRouter.post("/:id/book", bookAmenity);
amenityRouter.put("/bookings/:id/cancel", cancelBooking);

export default amenityRouter;

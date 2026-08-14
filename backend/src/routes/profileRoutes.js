import express from "express";

const profileRouter = express.Router();

import {
  getProfile,
  updateProfile,
  changePassword,
  addEmergencyContact,
  removeEmergencyContact,
  addVehicle,
  removeVehicle,
  getFlatDetails,
} from "../controllers/profileController.js";

const { protect } = require("../middleware/auth");

profileRouter.use(protect);

profileRouter.get("/", getProfile);
profileRouter.put("/", updateProfile);
profileRouter.put("/change-password", changePassword);
profileRouter.post("/emergency-contact", addEmergencyContact);
profileRouter.delete("/emergency-contact/:contactId", removeEmergencyContact);
profileRouter.post("/vehicle", addVehicle);
profileRouter.delete("/vehicle/:vehicleId", removeVehicle);
profileRouter.get("/flat", getFlatDetails);

export default profileRouter;

import express from "express";
import {
  getVehicles,
  registerVehicle,
  updateVehicle,
  deregisterVehicle,
  getAllVehicles,
} from "../controllers/vehicleController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.use(roleMiddleware(["Resident"]));
router.get("/", getVehicles);
router.post("/register", registerVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deregisterVehicle);

router.get("/admin/all", roleMiddleware(["Admin"]), getAllVehicles);

export default router;

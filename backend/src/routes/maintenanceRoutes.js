import express from "express";

const maintenanceRouter = express.Router();
import {
  getMaintenanceDues,
  getMaintenanceById,
  createMaintenance,
  payMaintenance,
  generateReceipt,
  getMaintenanceSummary,
} from "../controllers/maintenanceController.js";
import { protect, authorize } from "../middleware/auth.js";

maintenanceRouter.use(protect);

maintenanceRouter.get("/", getMaintenanceDues);
maintenanceRouter.get("/summary", getMaintenanceSummary);
maintenanceRouter.get("/:id", getMaintenanceById);
maintenanceRouter.get("/:id/receipt", generateReceipt);
maintenanceRouter.post("/", authorize("admin"), createMaintenance);
maintenanceRouter.put("/:id/pay", payMaintenance);

export default maintenanceRouter;

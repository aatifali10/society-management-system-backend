import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDatabase from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import maintenanceRouter from "./routes/maintenanceRoutes.js";
import VisitorRouter from "./routes/visitorRoutes.js";
import complaintRouter from "./routes/complaintRoutes.js";
import amenityRouter from "./routes/amenityRoutes.js";
import noticeRouter from "./routes/noticeRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/admin", adminRoutes);

app.use("/profile", profileRouter);
app.use("/maintenance", maintenanceRouter);
app.use("/visitor", VisitorRouter);
app.use("/complaint", complaintRouter);
app.use("/amenity", amenityRouter);
app.use("/notice", noticeRouter);

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

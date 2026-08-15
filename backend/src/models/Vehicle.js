import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Resident ID is required"],
    },
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat ID is required"],
    },
    vehicle_number: {
      type: String,
      required: [true, "Vehicle number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicle_type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: ["Car", "Bike", "Scooter", "Auto", "Truck"],
      trim: true,
    },
    vehicle_model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },
    color: {
      type: String,
      default: "",
      trim: true,
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;

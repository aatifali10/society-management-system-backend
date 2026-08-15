import mongoose from "mongoose";

const gateLogSchema = new mongoose.Schema(
  {
    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      default: null,
    },
    visitor_name: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
    },
    visitor_type: {
      type: String,
      required: [true, "Visitor type is required"],
      enum: ["Guest", "Delivery Partner", "Service Provider", "Staff", "Other"],
      default: "Guest",
      trim: true,
    },
    vehicle_number: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat ID is required"],
    },
    flat_number: {
      type: String,
      required: [true, "Flat number is required"],
      trim: true,
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    gate_id: {
      type: String,
      default: "Main Gate",
      trim: true,
    },
    entry_time: {
      type: Date,
      required: [true, "Entry time is required"],
    },
    exit_time: {
      type: Date,
      default: null,
    },
    entry_pass_code: {
      type: String,
      default: null,
    },
    logged_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Logged by security ID is required"],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const GateLog = mongoose.model("GateLog", gateLogSchema);

export default GateLog;

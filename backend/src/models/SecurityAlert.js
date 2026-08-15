import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema(
  {
    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      default: null,
    },
    alert_type: {
      type: String,
      required: [true, "Alert type is required"],
      enum: [
        "Overstay",
        "Unauthorized Entry",
        "Delivery Alert",
        "Security Breach",
        "Other",
      ],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    alert_status: {
      type: String,
      enum: ["Active", "Acknowledged", "Resolved"],
      default: "Active",
    },
    triggered_by: {
      type: String,
      default: "System",
      trim: true,
    },
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      default: null,
    },
    gate_id: {
      type: String,
      default: "Main Gate",
      trim: true,
    },
    trigger_time: {
      type: Date,
      default: Date.now,
    },
    resolved_time: {
      type: Date,
      default: null,
    },
    resolution_notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const SecurityAlert = mongoose.model("SecurityAlert", securityAlertSchema);

export default SecurityAlert;

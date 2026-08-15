import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Plumbing",
        "Electrical",
        "Elevator",
        "Cleaning",
        "Maintenance",
        "Security",
        "Other",
      ],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    photo_url: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sla_due_date: {
      type: Date,
      default: null,
    },
    resolution_date: {
      type: Date,
      default: null,
    },
    resolution_notes: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;

import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "plumbing",
        "electrical",
        "elevator",
        "carpentry",
        "painting",
        "cleaning",
        "security",
        "pest_control",
        "other",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected", "on_hold"],
      default: "pending",
    },
    photos: [
      {
        type: String,
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedDate: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ flat: 1, createdAt: -1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);

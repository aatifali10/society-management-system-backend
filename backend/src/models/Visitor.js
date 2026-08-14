import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
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
    visitorName: {
      type: String,
      required: true,
    },
    visitorPhone: {
      type: String,
      required: true,
    },
    visitorEmail: {
      type: String,
    },
    vehicleNumber: {
      type: String,
    },
    visitorType: {
      type: String,
      enum: ["guest", "delivery", "cab", "service", "other"],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime: {
      type: Date,
    },
    expiryTime: {
      type: Date,
      required: true,
    },
    qrCode: {
      type: String,
    },
    qrCodeData: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "checked_in",
        "checked_out",
        "expired",
      ],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gatePassNumber: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
    },
    isPreApproved: {
      type: Boolean,
      default: false,
    },
    idProof: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

visitorSchema.pre("save", function (next) {
  if (!this.gatePassNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.gatePassNumber = `GP${year}${month}${day}${random}`;
  }
  next();
});

export const Visitor = mongoose.model("Visitor", visitorSchema);

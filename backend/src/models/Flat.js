import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    flatNumber: {
      type: String,
      required: true,
      unique: true,
    },
    tower: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["1BHK", "2BHK", "3BHK", "4BHK"],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    currentResidents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOccupied: {
      type: Boolean,
      default: false,
    },
    maintenanceDue: {
      type: Number,
      default: 0,
    },
    lastMaintenancePaid: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Flat = mongoose.model("Flat", flatSchema);

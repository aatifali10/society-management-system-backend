import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "clubhouse",
        "swimming_pool",
        "sports_court",
        "party_hall",
        "gym",
        "playground",
        "park",
      ],
      required: true,
    },
    description: {
      type: String,
    },
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    bookingFee: {
      type: Number,
      default: 0,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    operatingHours: {
      start: {
        type: String,
        default: "06:00",
      },
      end: {
        type: String,
        default: "22:00",
      },
    },
    timeSlots: [
      {
        startTime: String,
        endTime: String,
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    rules: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Amenity = mongoose.model("Amenity", amenitySchema);

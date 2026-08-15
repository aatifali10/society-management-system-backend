import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"],
      enum: [
        "Clubhouse",
        "Swimming Pool",
        "Sports Courts",
        "Party Hall",
        "Gym",
        "Yoga Studio",
      ],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    booking_slots: [
      {
        date: Date,
        time_from: String,
        time_to: String,
        is_available: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Amenity = mongoose.model("Amenity", amenitySchema);

export default Amenity;

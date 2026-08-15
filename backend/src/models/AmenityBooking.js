import mongoose from "mongoose";

const amenityBookingSchema = new mongoose.Schema(
  {
    amenity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity",
      required: [true, "Amenity ID is required"],
    },
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
    booking_date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    time_from: {
      type: String,
      required: [true, "Start time is required"],
    },
    time_to: {
      type: String,
      required: [true, "End time is required"],
    },
    number_of_guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest is required"],
    },
    booking_status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    special_requirements: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const AmenityBooking = mongoose.model("AmenityBooking", amenityBookingSchema);

export default AmenityBooking;

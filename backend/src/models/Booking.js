import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    amenity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    bookingFee: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    specialRequests: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInTime: {
      type: Date,
    },
    checkedOut: {
      type: Boolean,
      default: false,
    },
    checkedOutTime: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    cancellationDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
    },
    bookingReference: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.bookingReference = `BK${year}${month}${day}${random}`;
  }
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);

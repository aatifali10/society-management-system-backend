import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    visitor_name: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    visitor_type: {
      type: String,
      enum: [
        "Guest",
        "Delivery Partner",
        "Service Provider",
        "Cab Operator",
        "Other",
      ],
      default: "Guest",
      trim: true,
    },
    vehicle_number: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    vehicle_type: {
      type: String,
      default: "",
      enum: ["", "Car", "Bike", "Scooter", "Auto", "Truck"],
    },
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat reference is required"],
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    gate_pass_code: {
      type: String,
      default: null,
    },
    qr_code: {
      type: String,
      default: null,
    },
    entry_timestamp: {
      type: Date,
      default: null,
    },
    exit_timestamp: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pre-Approved", "Entered", "Exited"],
      default: "Pre-Approved",
    },
    approval_date: {
      type: Date,
      default: Date.now,
    },
    valid_from: {
      type: Date,
      default: Date.now,
    },
    valid_till: {
      type: Date,
      required: [true, "Pass validity period is required"],
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;

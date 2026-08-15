import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
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
    contact_name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, "Relationship is required"],
      enum: ["Spouse", "Child", "Parent", "Sibling", "Friend", "Other"],
      trim: true,
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const EmergencyContact = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema,
);

export default EmergencyContact;

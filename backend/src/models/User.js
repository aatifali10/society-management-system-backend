import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relation: { type: String, trim: true },
  },
  { _id: false },
);

const familyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    age: { type: Number, min: 0 },
  },
  { _id: false },
);

const residentProfileSchema = new mongoose.Schema(
  {
    flatNumber: { type: String, trim: true },
    vehicleRegistrations: [{ type: String, trim: true }],
    emergencyContacts: [emergencyContactSchema],
    familyMembers: [familyMemberSchema],
    tenantDetails: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      moveInDate: { type: Date },
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["resident", "security", "admin"],
      default: "resident",
    },
    mfaEnabled: { type: Boolean, default: false },
    mfaCode: { type: String },
    mfaCodeExpiresAt: { type: Date },
    profile: residentProfileSchema,
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

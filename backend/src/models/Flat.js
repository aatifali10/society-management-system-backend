import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    block_name: {
      type: String,
      required: [true, "Block name is required"],
      trim: true,
    },
    flat_number: {
      type: String,
      required: [true, "Flat number is required"],
      trim: true,
    },
    occupancy_type: {
      type: String,
      enum: ["Owner", "Tenant"],
      required: [true, "Occupancy type must be either Owner or Tenant"],
    },
    owner_name: {
      type: String,
      default: "",
      trim: true,
    },
    owner_phone: {
      type: String,
      default: "",
      trim: true,
    },
    carpet_area: {
      type: Number,
      default: 0,
      min: [0, "Carpet area cannot be negative"],
    },
    is_occupied: {
      type: Boolean,
      default: false,
    },
    number_of_members: {
      type: Number,
      default: 0,
      min: [0, "Number of members cannot be negative"],
    },
    registered_vehicles: {
      type: Number,
      default: 0,
      min: [0, "Number of vehicles cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

const Flat = mongoose.model("Flat", flatSchema);

export default Flat;

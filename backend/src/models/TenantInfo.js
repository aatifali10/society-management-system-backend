import mongoose from "mongoose";

const tenantInfoSchema = new mongoose.Schema(
  {
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat ID is required"],
    },
    primary_resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Primary resident ID is required"],
    },
    tenant_members: [
      {
        member_name: {
          type: String,
          required: true,
          trim: true,
        },
        relationship: {
          type: String,
          required: true,
          enum: ["Spouse", "Child", "Parent", "Sibling", "Relative", "Other"],
          trim: true,
        },
        age: {
          type: Number,
          default: null,
        },
        occupation: {
          type: String,
          default: "",
          trim: true,
        },
        phone_number: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
    lease_start_date: {
      type: Date,
      required: [true, "Lease start date is required"],
    },
    lease_end_date: {
      type: Date,
      required: [true, "Lease end date is required"],
    },
    landlord_name: {
      type: String,
      default: "",
      trim: true,
    },
    landlord_contact: {
      type: String,
      default: "",
      trim: true,
    },
    total_occupants: {
      type: Number,
      required: [true, "Total occupants is required"],
      min: [1, "At least 1 occupant is required"],
    },
  },
  {
    timestamps: true,
  },
);

const TenantInfo = mongoose.model("TenantInfo", tenantInfoSchema);

export default TenantInfo;

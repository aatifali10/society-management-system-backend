import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    flat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat reference is required"],
    },
    billing_month: {
      type: String,
      required: [true, "Billing month is required"],
      trim: true,
    },
    base_amount: {
      type: Number,
      required: [true, "Base amount is required"],
      min: [0, "Base amount cannot be negative"],
    },
    charges_breakdown: {
      maintenance: {
        type: Number,
        default: 0,
        min: [0, "Cannot be negative"],
      },
      water: {
        type: Number,
        default: 0,
        min: [0, "Cannot be negative"],
      },
      security: {
        type: Number,
        default: 0,
        min: [0, "Cannot be negative"],
      },
      repairs: {
        type: Number,
        default: 0,
        min: [0, "Cannot be negative"],
      },
      other: {
        type: Number,
        default: 0,
        min: [0, "Cannot be negative"],
      },
    },
    amount_due: {
      type: Number,
      required: [true, "Amount due is required"],
      min: [0, "Amount due cannot be negative"],
    },
    penalty_amount: {
      type: Number,
      default: 0,
      min: [0, "Penalty amount cannot be negative"],
    },
    total_due: {
      type: Number,
      required: [true, "Total due is required"],
    },
    due_date: {
      type: Date,
      required: [true, "Due date is required"],
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Partial"],
      default: "Pending",
    },
    payment_date: {
      type: Date,
      default: null,
    },
    payment_method: {
      type: String,
      enum: ["Online", "Cheque", "Bank Transfer", "Cash", "Pending"],
      default: "Pending",
    },
    transaction_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Bill = mongoose.model("Bill", billSchema);

export default Bill;

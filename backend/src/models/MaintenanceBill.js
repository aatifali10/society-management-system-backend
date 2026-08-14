import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    charges: {
      water: {
        type: Number,
        required: true,
      },
      security: {
        type: Number,
        required: true,
      },
      repairs: {
        type: Number,
        required: true,
      },
      cleaning: {
        type: Number,
        required: true,
      },
      electricity: {
        type: Number,
        required: true,
      },
      others: {
        type: Number,
        default: 0,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partial'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'upi', 'online'],
    },
    paymentId: {
      type: String,
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    invoiceUrl: {
      type: String,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate receipt number before saving
maintenanceSchema.pre('save', function (next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.receiptNumber = `REC${year}${month}${random}`;
  }
  next();
});

export const Maintenance= mongoose.model('Maintenance', maintenanceSchema);
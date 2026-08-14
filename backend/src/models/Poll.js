import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        votes: {
          type: Number,
          default: 0,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["general", "society", "maintenance", "event"],
      default: "general",
    },
    voters: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        optionIndex: Number,
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    maxVotes: {
      type: Number,
      default: 1,
    },
    visibility: {
      type: String,
      enum: ["all", "towers", "flats"],
      default: "all",
    },
    targetTowers: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Poll = mongoose.model("Poll", pollSchema);

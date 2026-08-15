import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Poll question is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    options: [
      {
        option_text: {
          type: String,
          required: true,
        },
        vote_count: {
          type: Number,
          default: 0,
        },
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by admin ID is required"],
    },
    poll_status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
    total_votes: {
      type: Number,
      default: 0,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;

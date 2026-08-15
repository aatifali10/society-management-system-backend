import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    poll_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: [true, "Poll ID is required"],
    },
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
    selected_option: {
      type: String,
      required: [true, "Selected option is required"],
    },
    voted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

voteSchema.index({ poll_id: 1, resident_id: 1 }, { unique: true });

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;

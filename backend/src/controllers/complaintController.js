import Complaint from "../models/Complaint";
import Flat from "../models/Flat";

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, photos } = req.body;

    const flat = await Flat.findOne({ flatNumber: req.user.flatNumber });

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const complaint = await Complaint.create({
      flat: flat._id,
      user: req.user.id,
      title,
      description,
      category,
      priority,
      photos: photos || [],
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, startDate, endDate } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const complaints = await Complaint.find(query)
      .populate("flat", "flatNumber tower")
      .populate("user", "name email phone")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("flat", "flatNumber tower")
      .populate("user", "name email phone")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (
      complaint.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this complaint",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { status, assignedTo, comments, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (
      complaint.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this complaint",
      });
    }

    if (status) {
      complaint.status = status;
      if (status === "resolved") {
        complaint.resolvedDate = new Date();
      }
    }
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (comments) {
      complaint.comments.push({
        user: req.user.id,
        comment: comments,
      });
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (
      complaint.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to comment on this complaint",
      });
    }

    complaint.comments.push({
      user: req.user.id,
      comment,
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to rate this complaint",
      });
    }

    if (complaint.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Can only rate resolved complaints",
      });
    }

    complaint.rating = rating;
    complaint.feedback = feedback;
    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const averageResolutionTime = await Complaint.aggregate([
      {
        $match: {
          user: req.user._id,
          status: "resolved",
          resolvedDate: { $exists: true },
        },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedDate", "$createdAt"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$resolutionTime" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        categoryStats,
        averageResolutionTime:
          averageResolutionTime.length > 0
            ? averageResolutionTime[0].average
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

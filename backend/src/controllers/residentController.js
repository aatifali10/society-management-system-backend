import Bill from "../models/Bill.js";
import Visitor from "../models/Visitor.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Notice from "../models/Notice.js";
import Flat from "../models/Flat.js";

export const getBills = async (req, res, next) => {
  try {
    let flatId = req.user.flat_id;

    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const bills = await Bill.find({ flat_id: flatId }).populate("flat_id");

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

export const payBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found.",
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (flatId && bill.flat_id.toString() !== flatId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only pay bills for your own flat.",
      });
    }

    if (bill.payment_status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Bill has already been paid.",
      });
    }

    bill.payment_status = "Paid";
    await bill.save();

    res.status(200).json({
      success: true,
      message: "Payment processed successfully.",
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

export const generateVisitorPass = async (req, res, next) => {
  try {
    const { visitor_name, phone, vehicle_number } = req.body;

    if (!visitor_name || !phone) {
      return res.status(400).json({
        success: false,
        message: "visitor_name and phone are required.",
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message:
          "No flat associated with this resident account to issue visitor pass.",
      });
    }

    const gatePassCode = Math.floor(100000 + Math.random() * 900000).toString();

    const visitor = await Visitor.create({
      visitor_name,
      phone,
      vehicle_number: vehicle_number || "",
      flat_id: flatId,
      gate_pass_code: gatePassCode,
      status: "Pre-Approved",
    });

    res.status(201).json({
      success: true,
      message: "Visitor pass generated successfully.",
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

export const raiseComplaint = async (req, res, next) => {
  try {
    const { category, description } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: "category and description are required.",
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const photoUrl = req.file ? req.file.path : "";

    const complaint = await Complaint.create({
      resident_id: req.user.id,
      flat_id: flatId,
      category,
      description,
      photo_url: photoUrl,
      status: "Pending",
      priority: "Medium",
    });

    res.status(201).json({
      success: true,
      message: "Complaint lodged successfully.",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ resident_id: req.user.id })
      .populate("flat_id", "block_name flat_number")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["Pending", "In-Progress", "Resolved", "Closed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required: Pending, In-Progress, Resolved, Closed",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (complaint.resident_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this complaint.",
      });
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully.",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate("created_by", "username")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitorPasses = async (req, res, next) => {
  try {
    let flatId = req.user.flat_id;

    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const passes = await Visitor.find({ flat_id: flatId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: passes.length,
      data: passes,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    let flatId = req.user.flat_id;

    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const user = await User.findById(req.user.id);
    const flat = await Flat.findById(flatId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
        },
        flat: flat,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { email, phone_number } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use.",
        });
      }
      user.email = email;
    }

    if (phone_number) user.phone_number = phone_number;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    let flatId = req.user.flat_id;

    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const bills = await Bill.find({
      flat_id: flatId,
      payment_status: "Pending",
    }).limit(3);
    const complaints = await Complaint.find({
      resident_id: req.user.id,
      status: { $ne: "Closed" },
    }).limit(3);
    const passes = await Visitor.find({
      flat_id: flatId,
      status: "Pre-Approved",
    }).limit(3);
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(5);

    const totalBills = await Bill.countDocuments({ flat_id: flatId });
    const totalComplaints = await Complaint.countDocuments({
      resident_id: req.user.id,
    });
    const totalPendingBills = await Bill.countDocuments({
      flat_id: flatId,
      payment_status: "Pending",
    });

    res.status(200).json({
      success: true,
      data: {
        recent_bills: bills,
        recent_complaints: complaints,
        recent_passes: passes,
        recent_notices: notices,
        summary: {
          total_bills: totalBills,
          total_complaints: totalComplaints,
          pending_bills: totalPendingBills,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

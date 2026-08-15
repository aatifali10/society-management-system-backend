import Flat from "../models/Flat.js";
import User from "../models/User.js";
import Bill from "../models/Bill.js";
import Notice from "../models/Notice.js";
import Complaint from "../models/Complaint.js";
import GateLog from "../models/GateLog.js";

export const createFlat = async (req, res, next) => {
  try {
    const { block_name, flat_number, occupancy_type } = req.body;

    if (!block_name || !flat_number || !occupancy_type) {
      return res.status(400).json({
        success: false,
        message: "block_name, flat_number, and occupancy_type are required.",
      });
    }

    const existingFlat = await Flat.findOne({ block_name, flat_number });
    if (existingFlat) {
      return res.status(409).json({
        success: false,
        message: `Flat ${flat_number} in Block ${block_name} already exists.`,
      });
    }

    const flat = await Flat.create({
      block_name,
      flat_number,
      occupancy_type,
    });

    res.status(201).json({
      success: true,
      message: "Flat created successfully",
      data: flat,
    });
  } catch (error) {
    next(error);
  }
};

export const onboardResident = async (req, res, next) => {
  try {
    const { username, password, flat_id } = req.body;

    if (!username || !password || !flat_id) {
      return res.status(400).json({
        success: false,
        message: "username, password, and flat_id are required.",
      });
    }

    const flat = await Flat.findById(flat_id);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Specified flat does not exist.",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username is already in use.",
      });
    }

    const user = await User.create({
      username,
      password,
      role: "Resident",
      flat_id,
    });

    res.status(201).json({
      success: true,
      message: "Resident onboarded successfully",
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        flat_id: user.flat_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateBills = async (req, res, next) => {
  try {
    const { amount_due, due_date } = req.body;

    if (!amount_due || !due_date) {
      return res.status(400).json({
        success: false,
        message: "amount_due and due_date are required.",
      });
    }

    const flats = await Flat.find();
    if (flats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No flats found to generate bills for.",
      });
    }

    const billDocuments = flats.map((flat) => ({
      flat_id: flat._id,
      amount_due,
      due_date: new Date(due_date),
      payment_status: "Pending",
    }));

    const createdBills = await Bill.insertMany(billDocuments);

    res.status(201).json({
      success: true,
      message: `Generated ${createdBills.length} maintenance bills successfully.`,
      count: createdBills.length,
      data: createdBills,
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastNotice = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "title and description are required.",
      });
    }

    const notice = await Notice.create({
      title,
      description,
      created_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Notice broadcasted successfully",
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

export const getResidents = async (req, res, next) => {
  try {
    const residents = await User.find({ role: "Resident" })
      .populate("flat_id", "block_name flat_number occupancy_type")
      .select("-password");

    res.status(200).json({
      success: true,
      count: residents.length,
      data: residents,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const { status, assigned_to } = req.query;

    const query = {};
    if (status) query.status = status;
    if (assigned_to) query.assigned_to = assigned_to;

    const complaints = await Complaint.find(query)
      .populate("resident_id", "username email phone_number")
      .populate("flat_id", "block_name flat_number")
      .populate("assigned_to", "username")
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

export const assignComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { assigned_to, sla_due_date } = req.body;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: "assigned_to is required",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    complaint.assigned_to = assigned_to;
    complaint.status = "In-Progress";
    if (sla_due_date) complaint.sla_due_date = new Date(sla_due_date);

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully.",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, resolution_notes } = req.body;

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

    complaint.status = status;
    if (resolution_notes) complaint.resolution_notes = resolution_notes;
    if (status === "Resolved" || status === "Closed") {
      complaint.resolution_date = new Date();
    }

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

export const getBillingReport = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate("flat_id", "block_name flat_number occupancy_type")
      .sort({ due_date: 1 });

    const total_bills = bills.length;
    const paid_bills = bills.filter((b) => b.payment_status === "Paid").length;
    const pending_bills = bills.filter(
      (b) => b.payment_status === "Pending",
    ).length;
    const overdue_bills = bills.filter(
      (b) => b.due_date < new Date() && b.payment_status === "Pending",
    ).length;

    const total_collected = bills
      .filter((b) => b.payment_status === "Paid")
      .reduce((sum, b) => sum + b.total_due, 0);

    const total_pending = bills
      .filter((b) => b.payment_status === "Pending")
      .reduce((sum, b) => sum + b.total_due, 0);

    res.status(200).json({
      success: true,
      summary: {
        total_bills,
        paid_bills,
        pending_bills,
        overdue_bills,
        total_collected,
        total_pending,
        collection_percentage:
          total_bills > 0 ? ((paid_bills / total_bills) * 100).toFixed(2) : 0,
      },
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

export const applyPenalty = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const { penalty_amount } = req.body;

    if (!penalty_amount || penalty_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid penalty_amount is required",
      });
    }

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found.",
      });
    }

    bill.penalty_amount = penalty_amount;
    bill.total_due = bill.amount_due + penalty_amount;
    bill.payment_status = "Overdue";

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Penalty applied successfully.",
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const totalResidents = await User.countDocuments({ role: "Resident" });
    const totalFlats = await Flat.countDocuments();
    const occupiedFlats = await Flat.countDocuments({ is_occupied: true });

    const bills = await Bill.find();
    const totalDues = bills.reduce((sum, b) => sum + b.total_due, 0);
    const collectedDues = bills
      .filter((b) => b.payment_status === "Paid")
      .reduce((sum, b) => sum + b.total_due, 0);
    const pendingDues = bills
      .filter((b) => b.payment_status === "Pending")
      .reduce((sum, b) => sum + b.total_due, 0);

    const openComplaints = await Complaint.countDocuments({
      status: { $in: ["Pending", "In-Progress"] },
    });
    const totalComplaints = await Complaint.countDocuments();

    const todayLogs = await GateLog.countDocuments({
      entry_time: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    const recentComplaints = await Complaint.find({ status: { $ne: "Closed" } })
      .populate("resident_id", "username email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_residents: totalResidents,
          total_flats: totalFlats,
          occupied_flats: occupiedFlats,
          vacancy_rate:
            totalFlats > 0
              ? (((totalFlats - occupiedFlats) / totalFlats) * 100).toFixed(2)
              : 0,
          total_dues: totalDues,
          collected_dues: collectedDues,
          pending_dues: pendingDues,
          collection_percentage:
            totalDues > 0 ? ((collectedDues / totalDues) * 100).toFixed(2) : 0,
          open_complaints: openComplaints,
          total_complaints: totalComplaints,
          today_gate_entries: todayLogs,
        },
        recent_complaints: recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

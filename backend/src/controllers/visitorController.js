import Visitor from "../models/Visitor";
import Flat from "../models/Flat";
import QRCode from "qrcode";

export const createVisitor = async (req, res) => {
  try {
    const {
      visitorName,
      visitorPhone,
      visitorEmail,
      vehicleNumber,
      visitorType,
      purpose,
      checkInTime,
      expiryTime,
      notes,
    } = req.body;

    const flat = await Flat.findOne({ flatNumber: req.user.flatNumber });

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const visitor = await Visitor.create({
      flat: flat._id,
      user: req.user.id,
      visitorName,
      visitorPhone,
      visitorEmail,
      vehicleNumber,
      visitorType,
      purpose,
      checkInTime,
      expiryTime,
      notes,
    });

    const qrData = JSON.stringify({
      id: visitor._id,
      gatePassNumber: visitor.gatePassNumber,
      visitorName: visitor.visitorName,
      flatNumber: flat.flatNumber,
      tower: flat.tower,
    });

    QRCode.toDataURL(qrData, async (err, url) => {
      if (err) {
        console.error("QR Generation Error:", err);
      } else {
        visitor.qrCode = url;
        visitor.qrCodeData = qrData;
        await visitor.save();
      }
    });

    res.status(201).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVisitors = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const visitors = await Visitor.find(query)
      .populate("flat", "flatNumber tower")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate("flat", "flatNumber tower")
      .populate("user", "name email phone")
      .populate("approvedBy", "name email");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (
      visitor.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this visitor",
      });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateVisitorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this visitor",
      });
    }

    visitor.status = status;
    if (status === "approved") {
      visitor.approvedBy = req.user.id;
    }
    if (status === "checked_in") {
      visitor.checkInTime = new Date();
    }
    if (status === "checked_out") {
      visitor.checkOutTime = new Date();
    }

    await visitor.save();

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVisitorQR = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    if (visitor.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this QR code",
      });
    }

    if (!visitor.qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not generated yet",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        qrCode: visitor.qrCode,
        gatePassNumber: visitor.gatePassNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVisitorStats = async (req, res) => {
  try {
    const stats = await Visitor.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisitors = await Visitor.countDocuments({
      user: req.user._id,
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        todayVisitors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

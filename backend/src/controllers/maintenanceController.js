import fs from "fs";
import PDFDocument from "pdfkit";
import Flat from "../models/Flat.js";
import Maintenance from "../models/Maintenance.js";

export const getMaintenanceDues = async (req, res) => {
  try {
    const { status, year, month } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (year) query.year = year;
    if (month) query.month = month;

    const dues = await Maintenance.find(query)
      .populate("flat", "flatNumber tower")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dues.length,
      data: dues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate("flat", "flatNumber tower")
      .populate("user", "name email phone");

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    if (
      maintenance.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this record",
      });
    }

    res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createMaintenance = async (req, res) => {
  try {
    const { flatId, month, year, charges, dueDate } = req.body;

    const totalAmount = Object.values(charges).reduce(
      (sum, val) => sum + val,
      0,
    );

    const maintenance = await Maintenance.create({
      flat: flatId,
      user: req.user.id,
      month,
      year,
      charges,
      totalAmount,
      dueDate,
    });

    await Flat.findByIdAndUpdate(flatId, {
      $inc: { maintenanceDue: totalAmount },
    });

    res.status(201).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const payMaintenance = async (req, res) => {
  try {
    const { paymentMethod, paymentId } = req.body;

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    if (
      maintenance.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay this maintenance",
      });
    }

    if (maintenance.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Maintenance already paid",
      });
    }

    maintenance.status = "paid";
    maintenance.paidDate = new Date();
    maintenance.paymentMethod = paymentMethod;
    maintenance.paymentId = paymentId;

    await maintenance.save();

    await Flat.findByIdAndUpdate(maintenance.flat, {
      $inc: { maintenanceDue: -maintenance.totalAmount },
      lastMaintenancePaid: new Date(),
    });

    res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateReceipt = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate("flat", "flatNumber tower")
      .populate("user", "name email phone");

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    if (
      maintenance.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this receipt",
      });
    }

    const doc = new PDFDocument();
    const filename = `receipt-${maintenance.receiptNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    doc.pipe(res);

    doc.fontSize(20).text("Society Maintenance Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Receipt Number: ${maintenance.receiptNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(
      `Flat: ${maintenance.flat.flatNumber}, Tower: ${maintenance.flat.tower}`,
    );
    doc.text(`Resident: ${maintenance.user.name}`);
    doc.text(`Month: ${maintenance.month} ${maintenance.year}`);
    doc.moveDown();
    doc.text("Charges Breakdown:");
    Object.entries(maintenance.charges).forEach(([key, value]) => {
      if (value > 0) {
        doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ₹${value}`);
      }
    });
    doc.moveDown();
    doc.text(`Total Amount: ₹${maintenance.totalAmount}`, { bold: true });
    doc.text(`Status: ${maintenance.status.toUpperCase()}`);
    if (maintenance.paidDate) {
      doc.text(
        `Paid Date: ${new Date(maintenance.paidDate).toLocaleDateString()}`,
      );
      doc.text(`Payment Method: ${maintenance.paymentMethod}`);
    }

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMaintenanceSummary = async (req, res) => {
  try {
    const summary = await Maintenance.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalDue = await Maintenance.aggregate([
      {
        $match: {
          user: req.user._id,
          status: { $in: ["pending", "overdue"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary,
        totalDue: totalDue.length > 0 ? totalDue[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

import User from "../models/User.js";
import Flat from "../models/Flat.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken -resetPasswordToken -resetPasswordExpire",
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "emergencyContacts",
      "vehicleRegistrations",
      "familyMembers",
      "profilePicture",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = await user.matchPassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    const user = await User.findById(req.user.id);
    user.emergencyContacts.push({ name, phone, relationship });
    await user.save();

    res.status(201).json({
      success: true,
      data: user.emergencyContacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.emergencyContacts = user.emergencyContacts.filter(
      (contact) => contact._id.toString() !== req.params.contactId,
    );
    await user.save();

    res.status(200).json({
      success: true,
      data: user.emergencyContacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType } = req.body;

    const user = await User.findById(req.user.id);
    user.vehicleRegistrations.push({ vehicleNumber, vehicleType });
    await user.save();

    res.status(201).json({
      success: true,
      data: user.vehicleRegistrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeVehicle = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.vehicleRegistrations = user.vehicleRegistrations.filter(
      (vehicle) => vehicle._id.toString() !== req.params.vehicleId,
    );
    await user.save();

    res.status(200).json({
      success: true,
      data: user.vehicleRegistrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFlatDetails = async (req, res) => {
  try {
    const flat = await Flat.findOne({ flatNumber: req.user.flatNumber })
      .populate("owner", "name email phone")
      .populate("tenants", "name email phone")
      .populate("currentResidents", "name email phone");

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: flat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

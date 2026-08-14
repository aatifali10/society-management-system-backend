import Amenity from "../models/Amenity";
import Booking from "../models/Booking";
import Flat from "../models/Flat";

export const getAmenities = async (req, res) => {
  try {
    const { type, isAvailable } = req.query;

    const query = { isActive: true };
    if (type) query.type = type;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";

    const amenities = await Amenity.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: amenities.length,
      data: amenities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAmenityById = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createAmenity = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      capacity,
      location,
      bookingFee,
      depositAmount,
      operatingHours,
      rules,
      amenities,
    } = req.body;

    const amenity = await Amenity.create({
      name,
      type,
      description,
      capacity,
      location,
      bookingFee: bookingFee || 0,
      depositAmount: depositAmount || 0,
      operatingHours: operatingHours || { start: "06:00", end: "22:00" },
      rules: rules || [],
      amenities: amenities || [],
    });

    res.status(201).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide date, startTime, and endTime",
      });
    }

    const amenity = await Amenity.findById(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    if (!amenity.isAvailable) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: "Amenity is currently unavailable",
      });
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    const overlappingBookings = await Booking.find({
      amenity: req.params.id,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          date: new Date(date),
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    const isAvailable = overlappingBookings.length === 0;

    res.status(200).json({
      success: true,
      isAvailable,
      message: isAvailable
        ? "Amenity is available for the selected time slot"
        : "Amenity is already booked for the selected time slot",
      overlappingBookings: overlappingBookings.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bookAmenity = async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      purpose,
      numberOfPeople,
      specialRequests,
    } = req.body;

    const amenity = await Amenity.findById(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    if (!amenity.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Amenity is currently unavailable",
      });
    }

    const overlappingBookings = await Booking.find({
      amenity: req.params.id,
      status: { $in: ["pending", "confirmed"] },
      date: new Date(date),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Amenity is already booked for the selected time slot",
      });
    }

    const flat = await Flat.findOne({ flatNumber: req.user.flatNumber });

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const booking = await Booking.create({
      amenity: req.params.id,
      user: req.user.id,
      flat: flat._id,
      date: new Date(date),
      startTime,
      endTime,
      purpose,
      numberOfPeople,
      specialRequests,
      bookingFee: amenity.bookingFee,
      depositAmount: amenity.depositAmount,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(query)
      .populate("amenity", "name type location images")
      .populate("flat", "flatNumber tower")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    const bookingDate = new Date(booking.date);
    const currentDate = new Date();
    const daysDifference = Math.ceil(
      (bookingDate - currentDate) / (1000 * 60 * 60 * 24),
    );

    let refundAmount = 0;
    if (daysDifference >= 7) {
      refundAmount = booking.bookingFee + booking.depositAmount;
    } else if (daysDifference >= 3) {
      refundAmount = (booking.bookingFee + booking.depositAmount) * 0.5;
    } else if (daysDifference >= 1) {
      refundAmount = booking.depositAmount;
    }

    booking.status = "cancelled";
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

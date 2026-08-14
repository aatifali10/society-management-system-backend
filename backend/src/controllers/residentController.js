import store from "../data/store.js";

const getResidentUserId = (req) => req.user?.id || "resident-1";

export const getResidentDashboard = (req, res) => {
  const userId = getResidentUserId(req);
  const residentBills = store.bills.filter((bill) => bill.userId === userId);
  const residentPasses = store.visitorPasses.filter(
    (pass) => pass.userId === userId,
  );
  const residentComplaints = store.complaints.filter(
    (complaint) => complaint.userId === userId,
  );
  const bookings = store.bookings.filter(
    (booking) => booking.userId === userId,
  );

  return res.status(200).json({
    metrics: [
      { label: "Current Dues", value: "₹ 4,250" },
      { label: "Visitor Passes", value: String(residentPasses.length) },
      {
        label: "Open Complaints",
        value: String(
          residentComplaints.filter((item) => item.status !== "Resolved")
            .length,
        ),
      },
      { label: "Amenities Booked", value: String(bookings.length) },
    ],
    bills: residentBills,
    visitorPasses: residentPasses,
    complaints: residentComplaints,
    bookings,
    notices: store.notices,
    amenities: store.amenities,
  });
};

export const getProfile = (req, res) => {
  const userId = getResidentUserId(req);
  const profile = store.residentProfiles.find(
    (item) => item.userId === userId,
  ) || {
    userId,
    flatNumber: "",
    vehicleRegistrations: [],
    emergencyContacts: [],
    familyMembers: [],
    tenantDetails: null,
  };

  return res.status(200).json({ profile });
};

export const updateProfile = (req, res) => {
  const userId = getResidentUserId(req);
  const {
    flatNumber,
    vehicleRegistrations,
    emergencyContacts,
    familyMembers,
    tenantDetails,
  } = req.body;

  const existingProfile = store.residentProfiles.find(
    (item) => item.userId === userId,
  ) || {
    userId,
    flatNumber: "",
    vehicleRegistrations: [],
    emergencyContacts: [],
    familyMembers: [],
    tenantDetails: null,
  };

  const updatedProfile = {
    ...existingProfile,
    flatNumber: flatNumber ?? existingProfile.flatNumber,
    vehicleRegistrations:
      vehicleRegistrations ?? existingProfile.vehicleRegistrations,
    emergencyContacts: emergencyContacts ?? existingProfile.emergencyContacts,
    familyMembers: familyMembers ?? existingProfile.familyMembers,
    tenantDetails: tenantDetails ?? existingProfile.tenantDetails,
  };

  if (!store.residentProfiles.some((item) => item.userId === userId)) {
    store.residentProfiles.push(updatedProfile);
  } else {
    const index = store.residentProfiles.findIndex(
      (item) => item.userId === userId,
    );
    store.residentProfiles[index] = updatedProfile;
  }

  return res
    .status(200)
    .json({
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
};

export const getBills = (req, res) => {
  const bills = store.bills.filter(
    (bill) => bill.userId === getResidentUserId(req),
  );
  return res.status(200).json({ bills });
};

export const payBill = (req, res) => {
  const { billId } = req.params;
  const bill = store.bills.find(
    (item) => item.id === billId && item.userId === getResidentUserId(req),
  );

  if (!bill) {
    return res.status(404).json({ message: "Bill not found." });
  }

  bill.status = "Paid";
  return res
    .status(200)
    .json({ message: "Payment simulated successfully.", bill });
};

export const createVisitorPass = (req, res) => {
  const { guest, type, window, status = "Approved" } = req.body;

  if (!guest || !type || !window) {
    return res
      .status(400)
      .json({ message: "guest, type, and window are required." });
  }

  const pass = {
    id: `VP-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user?.id || "resident-1",
    guest,
    type,
    code: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
    window,
    status,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };

  store.visitorPasses.unshift(pass);
  return res
    .status(201)
    .json({ message: "Visitor pass created successfully.", pass });
};

export const getVisitorPasses = (req, res) => {
  const passes = store.visitorPasses.filter(
    (pass) => pass.userId === (req.user?.id || "resident-1"),
  );
  return res.status(200).json({ passes });
};

export const createComplaint = (req, res) => {
  const { title, category, priority = "Medium" } = req.body;

  if (!title || !category) {
    return res
      .status(400)
      .json({ message: "title and category are required." });
  }

  const complaint = {
    id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user?.id || "resident-1",
    title,
    category,
    status: "Pending",
    priority,
    sla: "2 days",
    createdAt: new Date().toISOString(),
  };

  store.complaints.unshift(complaint);
  return res
    .status(201)
    .json({ message: "Complaint raised successfully.", complaint });
};

export const updateComplaintStatus = (req, res) => {
  const { complaintId } = req.params;
  const { status } = req.body;
  const allowed = ["Pending", "In-Progress", "Resolved"];

  if (!status || !allowed.includes(status)) {
    return res
      .status(400)
      .json({
        message: "Valid status is required: Pending, In-Progress, Resolved.",
      });
  }

  const complaint = store.complaints.find(
    (item) => item.id === complaintId && item.userId === getResidentUserId(req),
  );

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }

  complaint.status = status;
  return res
    .status(200)
    .json({ message: "Complaint status updated successfully.", complaint });
};

export const getComplaints = (req, res) => {
  const complaints = store.complaints.filter(
    (item) => item.userId === (req.user?.id || "resident-1"),
  );
  return res.status(200).json({ complaints });
};

export const getAmenities = (req, res) => {
  return res.status(200).json({ amenities: store.amenities });
};

export const createAmenityBooking = (req, res) => {
  const { amenityId, slot } = req.body;

  if (!amenityId || !slot) {
    return res
      .status(400)
      .json({ message: "amenityId and slot are required." });
  }

  const amenity = store.amenities.find((item) => item.id === amenityId);
  if (!amenity) {
    return res.status(404).json({ message: "Amenity not found." });
  }

  const booking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user?.id || "resident-1",
    amenityId,
    name: amenity.name,
    slot,
    status: "Confirmed",
  };

  store.bookings.unshift(booking);
  return res
    .status(201)
    .json({ message: "Amenity booked successfully.", booking });
};

export const getNotices = (req, res) => {
  return res.status(200).json({ notices: store.notices });
};

export const getPolls = (req, res) => {
  return res.status(200).json({ polls: store.polls });
};

export const votePoll = (req, res) => {
  const { pollId } = req.params;
  const { optionId } = req.body;

  const poll = store.polls.find((item) => item.id === pollId);
  if (!poll) {
    return res.status(404).json({ message: "Poll not found." });
  }

  const option = poll.options.find((item) => item.id === optionId);
  if (!option) {
    return res.status(400).json({ message: "Invalid poll option." });
  }

  option.votes += 1;
  poll.totalVotes += 1;

  return res.status(200).json({ message: "Vote recorded successfully.", poll });
};

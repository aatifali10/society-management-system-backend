import store from "../data/store.js";

export const getSecurityDashboard = (req, res) => {
  return res.status(200).json({
    metrics: [
      { label: "Collected Dues", value: "₹ 8.6L" },
      { label: "Active Residents", value: "1,284" },
      { label: "Open Tickets", value: "17" },
      { label: "Gate Entries", value: "3,418" },
    ],
    alerts: store.securityAlerts,
    logs: store.securityLogs,
  });
};

export const createVisitorLog = (req, res) => {
  const { visitorName, vehicleNumber, targetFlat, entryTime } = req.body;

  if (!visitorName || !vehicleNumber || !targetFlat || !entryTime) {
    return res
      .status(400)
      .json({
        message:
          "visitorName, vehicleNumber, targetFlat, and entryTime are required.",
      });
  }

  const log = {
    id: `SL-${Math.floor(1000 + Math.random() * 9000)}`,
    name: visitorName,
    target: targetFlat,
    entry: entryTime,
    vehicle: vehicleNumber,
    status: "Approved",
  };

  store.securityLogs.unshift(log);
  return res
    .status(201)
    .json({ message: "Visitor log created successfully.", log });
};

export const verifyGatePass = (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Gate pass code is required." });
  }

  const match = store.visitorPasses.find(
    (pass) =>
      pass.code.toLowerCase() === String(code).toLowerCase() ||
      pass.id.toLowerCase() === String(code).toLowerCase(),
  );

  if (!match) {
    return res.status(404).json({ message: "Pass not found or invalid." });
  }

  return res.status(200).json({
    message: "Access verified successfully.",
    approved: true,
    guest: match.guest,
    type: match.type,
  });
};

export const getSecurityAlerts = (req, res) => {
  return res.status(200).json({ alerts: store.securityAlerts });
};

export const getSecurityLogs = (req, res) => {
  return res.status(200).json({ logs: store.securityLogs });
};

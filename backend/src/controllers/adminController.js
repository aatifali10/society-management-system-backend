import store from "../data/store.js";

export const getAdminDashboard = (req, res) => {
  return res.status(200).json({
    metrics: [
      { label: "Collected Dues", value: "₹ 8.6L" },
      { label: "Active Residents", value: "1,284" },
      { label: "Open Tickets", value: "17" },
      { label: "Gate Entries", value: "3,418" },
    ],
    residents: store.residents,
    tickets: store.helpdeskTickets,
    logs: store.securityLogs,
  });
};

export const getResidents = (req, res) => {
  return res.status(200).json({ residents: store.residents });
};

export const getBillingSummary = (req, res) => {
  return res.status(200).json({
    totalCollected: "₹ 8.6L",
    overdue: "₹ 1.2L",
    bills: store.bills,
  });
};

export const applyLatePenalty = (req, res) => {
  const { billId, penalty = 250 } = req.body;
  const bill = store.bills.find((item) => item.id === billId);

  if (!bill) {
    return res.status(404).json({ message: "Bill not found." });
  }

  bill.total = Number(bill.total) + Number(penalty);
  bill.status = "Overdue";

  return res
    .status(200)
    .json({ message: "Penalty applied successfully.", bill });
};

export const getHelpdeskTickets = (req, res) => {
  return res.status(200).json({ tickets: store.helpdeskTickets });
};

export const updateTicketStatus = (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  const allowed = ["Assigned", "In-Progress", "Resolved"];

  if (!status || !allowed.includes(status)) {
    return res
      .status(400)
      .json({
        message: "Valid status is required: Assigned, In-Progress, Resolved.",
      });
  }

  const ticket = store.helpdeskTickets.find((item) => item.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found." });
  }

  ticket.status = status;
  return res
    .status(200)
    .json({ message: "Ticket status updated successfully.", ticket });
};

export const createNotice = (req, res) => {
  const { title, tag = "Announcement", date } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required." });
  }

  const notice = {
    id: `NT-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    tag,
    date: date || new Date().toISOString().slice(0, 10),
  };

  store.notices.unshift(notice);
  return res
    .status(201)
    .json({ message: "Notice published successfully.", notice });
};

export const getGateLogs = (req, res) => {
  return res.status(200).json({ logs: store.securityLogs });
};

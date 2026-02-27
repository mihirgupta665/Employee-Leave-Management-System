import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../components/SidebarLayout";
import client from "../api/client";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const emptyReply = { status: "in_progress", adminReply: "" };

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyForm, setReplyForm] = useState(emptyReply);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const navItems = [
    { to: "/admin", label: "User Management" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/tickets", label: "Support Tickets" }
  ];

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const query = statusFilter === "all" ? "" : `?status=${statusFilter}`;
      const { data } = await client.get(`/tickets${query}`);
      setTickets(data.tickets || []);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Unable to fetch tickets");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const openReply = (ticket) => {
    setSelectedTicketId(ticket._id);
    setReplyForm({
      status: ticket.status === "open" ? "in_progress" : ticket.status,
      adminReply: ticket.adminReply || ""
    });
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!selectedTicketId) return;
    setUpdating(true);
    try {
      await client.patch(`/tickets/${selectedTicketId}/reply`, replyForm);
      toast.success("Ticket updated");
      setSelectedTicketId(null);
      setReplyForm(emptyReply);
      await loadTickets();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to update ticket");
      setError(msg);
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SidebarLayout title="Admin Support Tickets" items={navItems}>
      <section className="glass-card p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Employee Tickets</h2>
          <select
            className="field w-full max-w-[240px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <p className="text-slate-500">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-slate-500">No tickets found.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <article key={ticket._id} className="rounded-xl border border-slate-200/80 bg-white/75 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-800">{ticket.subject}</h3>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-cyan-100 px-2 py-1 capitalize text-cyan-700">
                      {ticket.category.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 capitalize text-amber-700">
                      {ticket.priority}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 capitalize text-slate-700">
                      {ticket.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Employee:</span> {ticket.employeeName} ({ticket.employeeEmail})
                </p>
                <p className="mt-2 text-sm text-slate-700">{ticket.description}</p>

                {ticket.adminReply && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                    <p className="font-semibold text-emerald-700">Current Admin Reply</p>
                    <p className="text-emerald-800">{ticket.adminReply}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => openReply(ticket)}
                  className="btn-primary mt-3 text-sm"
                >
                  Reply / Update
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTicketId && (
        <section className="glass-card border border-cyan-200/80 p-4 sm:p-5">
          <h2 className="mb-3 text-lg font-bold">Reply To Ticket</h2>
          <form onSubmit={submitReply} className="space-y-3">
            <select
              className="field"
              value={replyForm.status}
              onChange={(e) => setReplyForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <textarea
              className="field"
              rows="5"
              placeholder="Write admin response"
              value={replyForm.adminReply}
              onChange={(e) => setReplyForm((p) => ({ ...p, adminReply: e.target.value }))}
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={updating}>
                {updating ? "Saving..." : "Save Reply"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700"
                onClick={() => {
                  setSelectedTicketId(null);
                  setReplyForm(emptyReply);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </SidebarLayout>
  );
};

export default AdminTicketsPage;

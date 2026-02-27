import { useState } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../components/SidebarLayout";
import client from "../api/client";

const ApplyLeavePage = () => {
  const [form, setForm] = useState({
    leaveType: "sick",
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navItems = [
    { to: "/employee", label: "Dashboard" },
    { to: "/employee/apply", label: "Apply Leave" },
    { to: "/employee/history", label: "Leave History" },
    { to: "/employee/analytics", label: "Analytics" },
    { to: "/employee/tickets", label: "Support Tickets" }
  ];

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await client.post("/leaves", form);
      setMessage("Leave request submitted successfully");
      toast.success("Leave request submitted");
      setForm({ leaveType: "sick", fromDate: "", toDate: "", reason: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout title="Apply Leave" items={navItems}>
      <form onSubmit={onSubmit} className="glass-card mx-auto max-w-3xl space-y-4 p-5 sm:p-6">
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <label className="block text-sm font-semibold text-slate-700">Leave Type</label>
        <select
          className="field"
          name="leaveType"
          value={form.leaveType}
          onChange={onChange}
        >
          <option value="sick">Sick Leave</option>
          <option value="casual">Casual Leave</option>
          <option value="earned">Earned Leave</option>
        </select>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">From Date</label>
            <input
              className="field"
              type="date"
              name="fromDate"
              value={form.fromDate}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">To Date</label>
            <input
              className="field"
              type="date"
              name="toDate"
              value={form.toDate}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <label className="block text-sm font-semibold text-slate-700">Reason</label>
        <textarea
          className="field"
          rows="4"
          name="reason"
          value={form.reason}
          onChange={onChange}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </SidebarLayout>
  );
};

export default ApplyLeavePage;

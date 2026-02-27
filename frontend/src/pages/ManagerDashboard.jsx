import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../components/SidebarLayout";
import client from "../api/client";

const ManagerDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const navItems = [
    { to: "/manager", label: "Approval Queue" },
    { to: "/manager/analytics", label: "Analytics" }
  ];

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/leaves/review-queue");
      setLeaves(data.leaves);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const updateStatus = async (id, status) => {
    setProcessingId(id);
    try {
      await client.patch(`/leaves/${id}/status`, { status });
      toast.success(`Request ${status}`);
      await loadQueue();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SidebarLayout title="Manager Approval" items={navItems}>
      <section className="glass-card p-4 sm:p-5">
        {error && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <p className="text-slate-500">Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p className="text-slate-500">No leave requests to review.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.employeeName}</td>
                    <td className="capitalize">{leave.leaveType}</td>
                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="max-w-xs truncate sm:max-w-none">{leave.reason}</td>
                    <td>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize">
                        {leave.status}
                      </span>
                    </td>
                    <td className="space-x-2">
                      <button
                        className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1.5 text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70"
                        disabled={processingId === leave._id || leave.status !== "pending"}
                        onClick={() => updateStatus(leave._id, "approved")}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg bg-gradient-to-r from-rose-600 to-red-500 px-3 py-1.5 text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70"
                        disabled={processingId === leave._id || leave.status !== "pending"}
                        onClick={() => updateStatus(leave._id, "rejected")}
                        type="button"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SidebarLayout>
  );
};

export default ManagerDashboard;

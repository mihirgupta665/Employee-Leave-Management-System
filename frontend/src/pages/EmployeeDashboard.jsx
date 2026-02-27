import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client";
import SidebarLayout from "../components/SidebarLayout";
import StatCard from "../components/StatCard";

const EmployeeDashboard = () => {
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, leavesRes] = await Promise.all([
          client.get("/leaves/summary/my"),
          client.get("/leaves/my")
        ]);
        setSummary(summaryRes.data.summary);
        setRecent(leavesRes.data.leaves.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard");
        toast.error(err.response?.data?.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navItems = [
    { to: "/employee", label: "Dashboard" },
    { to: "/employee/apply", label: "Apply Leave" },
    { to: "/employee/history", label: "Leave History" },
    { to: "/employee/analytics", label: "Analytics" },
    { to: "/employee/tickets", label: "Support Tickets" }
  ];

  return (
    <SidebarLayout title="Employee Dashboard" items={navItems}>
      {error && <p className="glass-card rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending"
          value={summary.pending}
          colorClass="bg-gradient-to-r from-amber-500 to-orange-500"
        />
        <StatCard
          label="Approved"
          value={summary.approved}
          colorClass="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
        <StatCard
          label="Rejected"
          value={summary.rejected}
          colorClass="bg-gradient-to-r from-rose-500 to-red-500"
        />
        <Link
          to="/employee/apply"
          className="glass-card flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-4 font-bold text-white transition-transform duration-300 hover:-translate-y-1"
        >
          Apply Leave
        </Link>
      </div>

      <section className="glass-card p-4 sm:p-5">
        <h2 className="mb-3 text-xl font-bold">Recent Leave Requests</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-slate-500">No leave requests found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((leave) => (
                  <tr key={leave._id}>
                    <td className="capitalize">{leave.leaveType}</td>
                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize">
                        {leave.status}
                      </span>
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

export default EmployeeDashboard;

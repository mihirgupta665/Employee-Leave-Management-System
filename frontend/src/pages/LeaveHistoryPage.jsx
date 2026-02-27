import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SidebarLayout from "../components/SidebarLayout";
import client from "../api/client";

const LeaveHistoryPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navItems = [
    { to: "/employee", label: "Dashboard" },
    { to: "/employee/apply", label: "Apply Leave" },
    { to: "/employee/history", label: "Leave History" },
    { to: "/employee/analytics", label: "Analytics" },
    { to: "/employee/tickets", label: "Support Tickets" }
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await client.get("/leaves/my");
        setLeaves(data.leaves);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to fetch leave history");
        toast.error(err.response?.data?.message || "Unable to fetch leave history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SidebarLayout title="Leave History" items={navItems}>
      <section className="glass-card p-4 sm:p-5">
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="text-slate-500">No leave requests submitted yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="capitalize">{leave.leaveType}</td>
                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="max-w-xs truncate sm:max-w-none">{leave.reason}</td>
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

export default LeaveHistoryPage;

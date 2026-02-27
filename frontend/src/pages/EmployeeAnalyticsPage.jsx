import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import SidebarLayout from "../components/SidebarLayout";
import client from "../api/client";
import getApiErrorMessage from "../utils/getApiErrorMessage";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const daysInRangeInclusive = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate - startDate;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

const EmployeeAnalyticsPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("month");
  const [chartKey, setChartKey] = useState(0);

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
      setError("");
      try {
        const { data } = await client.get("/leaves/my");
        setLeaves(data.leaves || []);
        setTimeout(() => setChartKey((k) => k + 1), 120);
      } catch (err) {
        const msg = getApiErrorMessage(err, "Unable to load analytics");
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const typeDonutData = useMemo(() => {
    const counts = { sick: 0, casual: 0, earned: 0 };
    leaves.forEach((leave) => {
      counts[leave.leaveType] = (counts[leave.leaveType] || 0) + 1;
    });
    return {
      labels: ["Sick", "Casual", "Earned"],
      datasets: [
        {
          data: [counts.sick, counts.casual, counts.earned],
          backgroundColor: ["#ef4444", "#f59e0b", "#0ea5e9"],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    };
  }, [leaves]);

  const statusPieData = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    leaves.forEach((leave) => {
      counts[leave.status] = (counts[leave.status] || 0) + 1;
    });
    return {
      labels: ["Pending", "Approved", "Rejected"],
      datasets: [
        {
          data: [counts.pending, counts.approved, counts.rejected],
          backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    };
  }, [leaves]);

  const takenDaysBarData = useMemo(() => {
    const approvedLeaves = leaves.filter((leave) => leave.status === "approved");
    const now = new Date();

    if (viewMode === "month") {
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysByType = { sick: 0, casual: 0, earned: 0 };

      approvedLeaves.forEach((leave) => {
        const leaveStart = new Date(leave.fromDate);
        const leaveEnd = new Date(leave.toDate);
        const overlapStart = leaveStart > startMonth ? leaveStart : startMonth;
        const overlapEnd = leaveEnd < endMonth ? leaveEnd : endMonth;
        if (overlapStart <= overlapEnd) {
          const days = daysInRangeInclusive(overlapStart, overlapEnd);
          daysByType[leave.leaveType] = (daysByType[leave.leaveType] || 0) + days;
        }
      });

      return {
        labels: ["Sick", "Casual", "Earned"],
        datasets: [
          {
            label: "Approved Leave Days (Current Month)",
            data: [daysByType.sick, daysByType.casual, daysByType.earned],
            backgroundColor: ["#f43f5e", "#f59e0b", "#0ea5e9"],
            borderRadius: 10
          }
        ]
      };
    }

    const daysByMonth = new Array(12).fill(0);
    const year = now.getFullYear();

    approvedLeaves.forEach((leave) => {
      const leaveStart = new Date(leave.fromDate);
      const leaveEnd = new Date(leave.toDate);

      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0);
        const overlapStart = leaveStart > monthStart ? leaveStart : monthStart;
        const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;
        if (overlapStart <= overlapEnd) {
          daysByMonth[monthIndex] += daysInRangeInclusive(overlapStart, overlapEnd);
        }
      }
    });

    return {
      labels: monthNames,
      datasets: [
        {
          label: `Approved Leave Days (${year})`,
          data: daysByMonth,
          backgroundColor: "rgba(14, 165, 233, 0.68)",
          borderRadius: 8
        }
      ]
    };
  }, [leaves, viewMode]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1400,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: {
        labels: {
          color: "#0f172a",
          font: { weight: "600" }
        }
      },
      datalabels: {
        color: "#0f172a",
        font: { weight: "700" },
        formatter: (value, context) => {
          if (context.chart.config.type === "pie" || context.chart.config.type === "doughnut") {
            const data = context.dataset.data || [];
            const total = data.reduce((sum, item) => sum + Number(item || 0), 0);
            if (!total) return "0";
            const percent = Math.round((value / total) * 100);
            return `${value} (${percent}%)`;
          }
          return String(value);
        },
        anchor: "end",
        align: "top",
        offset: 2,
        clamp: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#334155" },
        grid: { color: "rgba(148, 163, 184, 0.20)" }
      },
      x: {
        ticks: { color: "#334155" },
        grid: { color: "rgba(148, 163, 184, 0.14)" }
      }
    }
  };

  return (
    <SidebarLayout title="Employee Analytics" items={navItems}>
      {error && <p className="glass-card rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <div className="glass-card p-5">
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="glass-card border border-rose-100/70 p-4 sm:p-5">
            <h2 className="mb-1 text-xl font-bold">Leave Type Usage (Doughnut)</h2>
            <p className="mb-3 text-sm text-slate-500">How your requests are distributed by leave type.</p>
            <div className="h-72">
              <Doughnut key={`type-donut-${chartKey}`} data={typeDonutData} options={chartOptions} />
            </div>
          </section>

          <section className="glass-card border border-sky-100/70 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Leave Days Taken (Bar)</h2>
                <p className="text-sm text-slate-500">Switch between current month and yearly monthly totals.</p>
              </div>
              <div className="flex rounded-xl border border-slate-300 bg-white/70 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    viewMode === "month" ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("year")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    viewMode === "year" ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="h-72">
              <Bar key={`days-bar-${viewMode}-${chartKey}`} data={takenDaysBarData} options={chartOptions} />
            </div>
          </section>

          <section className="glass-card border border-emerald-100/70 p-4 sm:p-5 xl:col-span-2">
            <h2 className="mb-1 text-xl font-bold">Request Status Distribution (Pie)</h2>
            <p className="mb-3 text-sm text-slate-500">Share of approved, pending, and rejected requests.</p>
            <div className="h-80">
              <Pie key={`status-pie-${chartKey}`} data={statusPieData} options={chartOptions} />
            </div>
          </section>
        </div>
      )}
    </SidebarLayout>
  );
};

export default EmployeeAnalyticsPage;

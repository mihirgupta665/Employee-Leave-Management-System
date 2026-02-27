import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import SidebarLayout from "../components/SidebarLayout";
import client from "../api/client";
import getApiErrorMessage from "../utils/getApiErrorMessage";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  ChartDataLabels
);

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [trendType, setTrendType] = useState("bar");
  const hasLoadedRef = useRef(false);
  const [chartKey, setChartKey] = useState(0);

  const navItems = [
    { to: "/admin", label: "User Management" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/tickets", label: "Support Tickets" }
  ];

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await client.get("/users/analytics");
        setAnalytics(data);
        setTimeout(() => setChartKey((k) => k + 1), 120);
      } catch (err) {
        const msg =
          err?.response?.status === 404
            ? "Analytics API missing. Restart backend so /api/users/analytics route loads."
            : getApiErrorMessage(err, "Unable to load analytics");
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const userPieData = useMemo(
    () => ({
      labels: ["Admins", "Managers", "Employees"],
      datasets: [
        {
          label: "Users by Role",
          data: analytics
            ? [analytics.totals.admins, analytics.totals.managers, analytics.totals.employees]
            : [0, 0, 0],
          backgroundColor: ["#2563eb", "#06b6d4", "#10b981"],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    }),
    [analytics]
  );

  const trendData = useMemo(
    () => ({
      labels: analytics ? analytics.monthlyUsers.map((m) => m.month) : [],
      datasets: [
        {
          label: "Users Created",
          data: analytics ? analytics.monthlyUsers.map((m) => m.total) : [],
          backgroundColor: "rgba(14, 165, 233, 0.45)",
          borderColor: "#0ea5e9",
          borderWidth: 3,
          fill: true,
          tension: 0.32,
          pointRadius: 4,
          pointBackgroundColor: "#0369a1"
        }
      ]
    }),
    [analytics]
  );

  const leaveDoughnutData = useMemo(
    () => ({
      labels: ["Pending", "Approved", "Rejected"],
      datasets: [
        {
          label: "Leave Status",
          data: analytics
            ? [analytics.leaves.pending, analytics.leaves.approved, analytics.leaves.rejected]
            : [0, 0, 0],
          backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    }),
    [analytics]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    scales: {
      y: {
        min: 0,
        max: 50,
        ticks: { stepSize: 10, color: "#334155" },
        grid: { color: "rgba(148,163,184,0.25)" }
      },
      x: {
        ticks: { color: "#334155" },
        grid: { color: "rgba(148,163,184,0.16)" }
      }
    },
    plugins: {
      legend: {
        labels: { color: "#0f172a", font: { weight: "600" } }
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
    }
  };

  return (
    <SidebarLayout title="Admin Analytics" items={navItems}>
      {error && <p className="glass-card rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-3xl font-extrabold">{analytics?.totals.totalUsers || 0}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Admins</p>
          <p className="text-3xl font-extrabold text-blue-600">{analytics?.totals.admins || 0}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Managers</p>
          <p className="text-3xl font-extrabold text-cyan-600">{analytics?.totals.managers || 0}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Employees</p>
          <p className="text-3xl font-extrabold text-emerald-600">{analytics?.totals.employees || 0}</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-5">
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="glass-card border border-cyan-100/60 p-4 sm:p-5">
            <h2 className="mb-1 text-xl font-bold">Role Distribution (Pie)</h2>
            <p className="mb-3 text-sm text-slate-500">Shows how users are split by role.</p>
            <div className="h-72">
              <Pie key={`admin-role-pie-${chartKey}`} data={userPieData} options={chartOptions} />
            </div>
          </section>

          <section className="glass-card border border-blue-100/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Monthly User Trend</h2>
                <p className="text-sm text-slate-500">Y-axis fixed from 0 to 50 users.</p>
              </div>
              <div className="flex rounded-xl border border-slate-300 bg-white/70 p-1">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    trendType === "bar" ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                  onClick={() => setTrendType("bar")}
                >
                  Histogram
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    trendType === "line" ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                  onClick={() => setTrendType("line")}
                >
                  Line
                </button>
              </div>
            </div>
            <div className="h-72">
              {trendType === "bar" ? (
                <Bar key={`admin-trend-bar-${chartKey}`} data={trendData} options={chartOptions} />
              ) : (
                <Line key={`admin-trend-line-${chartKey}`} data={trendData} options={chartOptions} />
              )}
            </div>
          </section>

          <section className="glass-card border border-emerald-100/60 p-4 sm:p-5 xl:col-span-2">
            <h2 className="mb-1 text-xl font-bold">Leave Workflow Status (Doughnut)</h2>
            <p className="mb-3 text-sm text-slate-500">
              Tracks pending, approved, and rejected requests.
            </p>
            <div className="h-80">
              <Doughnut
                key={`admin-leave-doughnut-${chartKey}`}
                data={leaveDoughnutData}
                options={chartOptions}
              />
            </div>
          </section>
        </div>
      )}
    </SidebarLayout>
  );
};

export default AdminAnalyticsPage;

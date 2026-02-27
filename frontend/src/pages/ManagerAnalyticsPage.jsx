import { useEffect, useMemo, useState } from "react";
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
import { Bar, Doughnut, Line } from "react-chartjs-2";
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

const monthLabel = (date) =>
  new Date(date).toLocaleString("en-US", { month: "short", year: "numeric" });

const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const ManagerAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [requests, setRequests] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [selectedMonth, setSelectedMonth] = useState("");

  const navItems = [
    { to: "/manager", label: "Approval Queue" },
    { to: "/manager/analytics", label: "Analytics" }
  ];

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await client.get("/leaves/analytics/manager");
        setSummary(data.summary || { pending: 0, approved: 0, rejected: 0 });
        setRequests(data.requests || []);
      } catch (err) {
        const msg = getApiErrorMessage(err, "Unable to load manager analytics");
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const monthOptions = useMemo(() => {
    const unique = [...new Set(requests.map((item) => getMonthKey(item.createdAt)))];
    return unique.sort((a, b) => (a > b ? -1 : 1));
  }, [requests]);

  useEffect(() => {
    if (!selectedMonth && monthOptions.length) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const statusDonutData = useMemo(
    () => ({
      labels: ["Pending", "Approved", "Rejected"],
      datasets: [
        {
          data: [summary.pending, summary.approved, summary.rejected],
          backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    }),
    [summary]
  );

  const weeklyTrendData = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    const filtered = requests.filter((item) => getMonthKey(item.createdAt) === selectedMonth);

    filtered.forEach((item) => {
      const day = new Date(item.createdAt).getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
      buckets[weekIndex] += 1;
    });

    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
      datasets: [
        {
          label: "Leave Requests",
          data: buckets,
          backgroundColor: "rgba(14, 165, 233, 0.5)",
          borderColor: "#0284c7",
          borderWidth: 2.5,
          borderRadius: 10,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#0f172a"
        }
      ]
    };
  }, [requests, selectedMonth]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
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
          if (context.chart.config.type === "doughnut") {
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
        ticks: { precision: 0, color: "#334155" },
        grid: { color: "rgba(148, 163, 184, 0.2)" }
      },
      x: {
        ticks: { color: "#334155" },
        grid: { color: "rgba(148, 163, 184, 0.15)" }
      }
    }
  };

  return (
    <SidebarLayout title="Manager Analytics" items={navItems}>
      {error && <p className="glass-card rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <div className="glass-card p-5">
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="glass-card border border-emerald-100/70 p-4 sm:p-5">
            <h2 className="mb-1 text-xl font-bold">Request Status (Doughnut)</h2>
            <p className="mb-3 text-sm text-slate-500">
              Pending, approved, and rejected leave requests across the system.
            </p>
            <div className="h-72">
              <Doughnut data={statusDonutData} options={chartOptions} />
            </div>
          </section>

          <section className="glass-card border border-sky-100/70 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Week-wise Requests</h2>
                <p className="text-sm text-slate-500">Monthly view, switchable between histogram and line.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700"
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {monthLabel(`${month}-01`)}
                    </option>
                  ))}
                </select>
                <div className="flex rounded-xl border border-slate-300 bg-white/70 p-1">
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      chartType === "bar" ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                    onClick={() => setChartType("bar")}
                  >
                    Histogram
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      chartType === "line" ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                    onClick={() => setChartType("line")}
                  >
                    Line
                  </button>
                </div>
              </div>
            </div>
            <div className="h-72">
              {chartType === "bar" ? (
                <Bar data={weeklyTrendData} options={chartOptions} />
              ) : (
                <Line data={weeklyTrendData} options={chartOptions} />
              )}
            </div>
          </section>
        </div>
      )}
    </SidebarLayout>
  );
};

export default ManagerAnalyticsPage;

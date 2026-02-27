const StatCard = ({ label, value, colorClass }) => (
  <div
    className={`glass-card group overflow-hidden p-4 text-white transition-transform duration-300 hover:-translate-y-1 ${colorClass}`}
  >
    <p className="text-sm font-semibold opacity-90">{label}</p>
    <div className="mt-2 flex items-end justify-between">
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <span className="rounded-full border border-white/40 bg-white/20 px-2 py-1 text-xs transition-transform duration-300 group-hover:scale-105">
        Updated
      </span>
    </div>
  </div>
);

export default StatCard;

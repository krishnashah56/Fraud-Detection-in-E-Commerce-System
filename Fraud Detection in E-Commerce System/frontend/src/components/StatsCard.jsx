const StatsCard = ({ title, value, caption, icon: Icon, tone = "default" }) => {
  const toneClasses =
    tone === "danger"
      ? "from-rose-50 to-white text-rose-600"
      : tone === "warning"
        ? "from-amber-50 to-white text-amber-600"
        : "from-cyan-50 to-white text-accent";

  return (
    <div
      className={`rounded-[28px] border border-white/70 bg-gradient-to-br ${toneClasses} p-6 shadow-panel`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {title}
          </p>
          <p className="mt-5 font-display text-4xl font-bold text-ink">{value}</p>
          <p className="mt-3 text-sm text-slate-500">{caption}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 text-current">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

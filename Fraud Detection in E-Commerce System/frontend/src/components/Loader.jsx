const Loader = ({ label = "Loading dashboard..." }) => {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-white/70 bg-white/70 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
        <div>
          <p className="font-semibold text-ink">{label}</p>
          <p className="text-sm text-slate-500">Syncing transactions and fraud signals.</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;

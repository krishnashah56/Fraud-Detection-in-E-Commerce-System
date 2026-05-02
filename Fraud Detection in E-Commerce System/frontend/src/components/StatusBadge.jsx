const toneMap = {
  ALLOW: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-teal-100 text-teal-700",
  REVIEW: "bg-amber-100 text-amber-700",
  BLOCK: "bg-rose-100 text-rose-700",
  REJECTED: "bg-rose-100 text-rose-700"
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
        toneMap[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

import StatusBadge from "./StatusBadge";
import { formatDateTime } from "../utils/formatters";

const FraudLogsTable = ({ logs = [] }) => {
  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
      <div className="mb-5">
        <h2 className="section-title">Fraud Logs</h2>
        <p className="mt-1 text-sm text-slate-500">
          Full audit trail of model decisions and analyst interventions.
        </p>
      </div>

      <div className="table-scroll overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th className="pb-2">Transaction</th>
              <th className="pb-2">User</th>
              <th className="pb-2">Event</th>
              <th className="pb-2">Risk</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Reason</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length ? (
              logs.map((log) => (
                <tr key={`${log.transactionId}-${log.createdAt}`} className="bg-white/75 text-sm">
                  <td className="rounded-l-2xl px-4 py-4 font-semibold text-ink">
                    {log.transactionId}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{log.userId}</td>
                  <td className="px-4 py-4 text-slate-600">{log.eventType}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{log.riskScore}%</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="max-w-sm px-4 py-4 text-slate-600">{log.reason}</td>
                  <td className="rounded-r-2xl px-4 py-4 text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500"
                >
                  Fraud logs will appear here after risky or reviewed transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FraudLogsTable;

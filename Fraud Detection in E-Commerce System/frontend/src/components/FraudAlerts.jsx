import { AlertTriangle, ArrowRight } from "lucide-react";

import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const FraudAlerts = ({ alerts = [], logs = [] }) => {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="section-title">Fraud Alerts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Highest-risk transactions detected by the ML screening service.
            </p>
          </div>
          <AlertTriangle className="text-rose-500" />
        </div>

        <div className="space-y-4">
          {alerts.length ? (
            alerts.map((alert) => (
              <article
                key={alert.transactionId}
                className="rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{alert.transactionId}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      User {alert.userId} · {formatCurrency(alert.amount)} · {alert.ipAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-rose-600">{alert.riskScore}%</p>
                    <StatusBadge status={alert.status} />
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {formatDateTime(alert.createdAt)}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-3xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No critical alerts right now.
            </p>
          )}
        </div>
      </section>

      <section className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
        <div className="mb-5">
          <h2 className="section-title">Recent Fraud Logs</h2>
          <p className="mt-1 text-sm text-slate-500">
            Investigator-facing audit trail for model decisions and admin overrides.
          </p>
        </div>

        <div className="space-y-3">
          {logs.length ? (
            logs.map((log) => (
              <div
                key={`${log.transactionId}-${log.createdAt}`}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white/70 p-4"
              >
                <div>
                  <p className="font-semibold text-ink">{log.transactionId}</p>
                  <p className="mt-1 text-sm text-slate-500">{log.reason}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-slate-500">
                  <span>{log.riskScore}%</span>
                  <ArrowRight size={16} />
                  <StatusBadge status={log.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-3xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              Fraud logs will appear here after the first suspicious checkout.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default FraudAlerts;

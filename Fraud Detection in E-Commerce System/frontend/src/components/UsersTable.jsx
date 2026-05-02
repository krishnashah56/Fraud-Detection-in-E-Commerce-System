import { formatDateTime } from "../utils/formatters";

const accountTone = {
  active: "bg-emerald-100 text-emerald-700",
  flagged: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700"
};

const UsersTable = ({ users = [] }) => {
  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
      <div className="mb-5">
        <h2 className="section-title">Users</h2>
        <p className="mt-1 text-sm text-slate-500">
          Customer risk posture and trusted device context from MongoDB.
        </p>
      </div>

      <div className="table-scroll overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th className="pb-2">User ID</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Trusted IP</th>
              <th className="pb-2">Fraud Count</th>
              <th className="pb-2">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((user) => (
                <tr key={user.userId} className="bg-white/75 text-sm">
                  <td className="rounded-l-2xl px-4 py-4 font-semibold text-ink">{user.userId}</td>
                  <td className="px-4 py-4 text-slate-700">{user.name}</td>
                  <td className="px-4 py-4 text-slate-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        accountTone[user.accountStatus] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.trustedIpAddress || "-"}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {user.historicalFraudCount}
                  </td>
                  <td className="rounded-r-2xl px-4 py-4 text-slate-500">
                    {user.lastOrderAt ? formatDateTime(user.lastOrderAt) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500"
                >
                  Users will appear here after seeding or first checkout activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;

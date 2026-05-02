import { useEffect, useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const TransactionTable = ({
  transactions,
  onReview,
  loadingId,
  filters,
  onFiltersChange,
  onBulkReview,
  bulkLoading
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState(filters?.search || "");
  const [dateFrom, setDateFrom] = useState(filters?.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters?.dateTo || "");

  useEffect(() => {
    setSearch(filters?.search || "");
    setDateFrom(filters?.dateFrom || "");
    setDateTo(filters?.dateTo || "");
  }, [filters]);

  const reviewableIds = useMemo(
    () => transactions.filter((transaction) => transaction.status === "REVIEW").map((transaction) => transaction.transactionId),
    [transactions]
  );

  const allSelected = reviewableIds.length > 0 && reviewableIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviewableIds);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const applyFilters = () => {
    onFiltersChange({ search, dateFrom, dateTo });
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    onFiltersChange({ search: "", dateFrom: "", dateTo: "" });
  };

  const selectedCount = selectedIds.length;
  const selectedReviewIds = selectedIds.filter((id) => reviewableIds.includes(id));

  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="section-title">Recent Transactions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search and filter to surface the exact user, amount, or time window you need.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user, txn ID, or IP"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div>{selectedCount} transaction{selectedCount > 1 ? "s" : ""} selected for bulk review</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => onBulkReview(selectedReviewIds, "APPROVE")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {bulkLoading ? "Processing..." : "Approve Selected"}
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => onBulkReview(selectedReviewIds, "REJECT")}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {bulkLoading ? "Processing..." : "Reject Selected"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-scroll overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th className="pb-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                </label>
              </th>
              <th className="pb-2">Transaction ID</th>
              <th className="pb-2">User ID</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">IP Address</th>
              <th className="pb-2">Risk Score</th>
              <th className="pb-2">Explainability</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Timestamp</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((transaction) => {
                const isReview = transaction.status === "REVIEW";
                const isLoading = loadingId === transaction.transactionId;

                return (
                  <tr key={transaction.transactionId} className="rounded-3xl bg-white/75 text-sm">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(transaction.transactionId)}
                        disabled={!isReview}
                        onChange={() => toggleSelect(transaction.transactionId)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold text-ink">
                      {transaction.transactionId}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{transaction.userId}</td>
                    <td className="px-4 py-4 text-slate-600">{formatCurrency(transaction.amount)}</td>
                    <td className="px-4 py-4 text-slate-600">{transaction.ipAddress}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-semibold ${
                          transaction.riskScore >= 85
                            ? "text-rose-600"
                            : transaction.riskScore >= 60
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }`}
                        title={transaction.reasonCodes?.join(" · ")}
                      >
                        {transaction.riskScore}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 max-w-[180px] truncate">
                      <div className="font-semibold text-slate-900">
                        {transaction.reasonCodes?.[0] ?? "Score details"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {transaction.vpnSuspected ? "VPN/Proxy suspected" : transaction.deviceType}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-500">{formatDateTime(transaction.createdAt)}</td>
                    <td className="px-4 py-4 text-right">
                      {isReview ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => onReview(transaction.transactionId, "APPROVE")}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            {isLoading ? "Saving..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => onReview(transaction.transactionId, "REJECT")}
                            className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            {isLoading ? "Saving..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-right text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          {transaction.status === "APPROVED" || transaction.status === "REJECTED"
                            ? "Reviewed"
                            : "No action"}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500"
                >
                  No transactions available yet. Seed the database or submit a checkout request.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;

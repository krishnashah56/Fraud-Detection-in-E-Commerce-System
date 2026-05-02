import { startTransition, useEffect, useState } from "react";
import { AlertCircle, Clock3, CreditCard, ShieldX } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

import {
  fetchDashboardStats,
  fetchFraudLogs,
  fetchRecentTransactions,
  fetchUsers,
  reviewTransaction,
  bulkReviewTransactions
} from "../api/adminApi";
import { formatCurrency } from "../utils/formatters";
import CheckoutSimulator from "../components/CheckoutSimulator";
import DatasetAnalyzer from "../components/DatasetAnalyzer";
import FraudAlerts from "../components/FraudAlerts";
import FraudChart from "../components/FraudChart";
import FraudLogsTable from "../components/FraudLogsTable";
import Loader from "../components/Loader";
import SectionShell from "../components/SectionShell";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import TransactionTable from "../components/TransactionTable";
import UsersTable from "../components/UsersTable";

const DashboardPage = () => {
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingId, setReviewingId] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [error, setError] = useState("");
  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: ""
  });

  const loadDashboard = async ({ silent = false, filters = transactionFilters } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [statsPayload, transactionsPayload, fraudLogsPayload, usersPayload] =
        await Promise.all([
        fetchDashboardStats(),
        fetchRecentTransactions(filters),
        fetchFraudLogs(),
        fetchUsers()
      ]);

      startTransition(() => {
        setDashboardStats(statsPayload);
        setTransactions(transactionsPayload);
        setFraudLogs(fraudLogsPayload);
        setUsers(usersPayload);
        setError("");
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard({ silent: true, filters: transactionFilters });

    const intervalId = window.setInterval(() => {
      loadDashboard({ silent: true, filters: transactionFilters });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [transactionFilters]);

  const handleTransactionFiltersChange = async (updates) => {
    const nextFilters = {
      ...transactionFilters,
      ...updates
    };
    setTransactionFilters(nextFilters);
    await loadDashboard({ silent: true, filters: nextFilters });
  };

  const handleBulkReview = async (transactionIds, action) => {
    if (!transactionIds.length) {
      return;
    }

    try {
      setBulkProcessing(true);
      await bulkReviewTransactions(transactionIds, action);
      await loadDashboard({ silent: true, filters: transactionFilters });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to perform bulk review."
      );
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleReview = async (transactionId, action) => {
    try {
      setReviewingId(transactionId);
      await reviewTransaction(transactionId, action);
      await loadDashboard({ silent: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to review transaction."
      );
    } finally {
      setReviewingId("");
    }
  };

  if (loading && !dashboardStats) {
    return (
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar activeItem={activeNav} onSelect={setActiveNav} />

        <main className="space-y-6">
          <div className="flex items-center justify-end">
            <button
              onClick={logout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Sign out
            </button>
          </div>

          <SectionShell
            eyebrow={activeNav}
            title={
              activeNav === "Dashboard"
                ? "Live fraud intelligence for e-commerce checkouts"
                : activeNav === "Fraud Logs"
                  ? "Audit every model decision and analyst override"
                  : activeNav === "Users"
                    ? "Inspect user trust signals and risk history"
                    : "Tune the demo, upload datasets, and generate live activity"
            }
            description={
              activeNav === "Dashboard"
                ? "Monitor blocked payments, triage pending reviews, and act on ML-driven fraud signals in one view."
                : activeNav === "Fraud Logs"
                  ? "Every fraud screening event and review decision is available here so the sidebar is no longer just decorative."
                  : activeNav === "Users"
                    ? "See which users are trusted, flagged, and carrying historical fraud risk in the database."
                    : "Use the simulator to create fresh transactions and upload batch datasets to see how many rows were allowed, reviewed, or blocked."
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600">
                Auto-refresh every 10s
              </span>
              <span className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
                {refreshing ? "Refreshing..." : "Live sync enabled"}
              </span>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <AlertCircle className="mt-0.5" size={18} />
                <span>{error}</span>
              </div>
            ) : null}
          </SectionShell>

          {activeNav === "Dashboard" ? (
            <>
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <StatsCard
                  title="Total Transactions"
                  value={dashboardStats?.stats.totalTransactions ?? 0}
                  caption="All transaction records observed by the screening layer."
                  icon={CreditCard}
                />
                <StatsCard
                  title="Blocked"
                  value={dashboardStats?.stats.blockedTransactions ?? 0}
                  caption="Transactions blocked automatically or rejected by analysts."
                  icon={ShieldX}
                  tone="danger"
                />
                <StatsCard
                  title="Pending Review"
                  value={dashboardStats?.stats.pendingReview ?? 0}
                  caption="Transactions waiting for manual analyst action."
                  icon={Clock3}
                  tone="warning"
                />
                <StatsCard
                  title="Fraud Rate"
                  value={`${dashboardStats?.stats.fraudRate ?? 0}%`}
                  caption="Fraud-classified volume across recent transaction history."
                  icon={AlertCircle}
                  tone="default"
                />
                <StatsCard
                  title="Loss Averted"
                  value={formatCurrency(dashboardStats?.stats.lossAverted ?? 0)}
                  caption="Blocked or rejected payments saved from payout."
                  icon={ShieldX}
                  tone="danger"
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
                <TransactionTable
                  transactions={transactions}
                  onReview={handleReview}
                  loadingId={reviewingId}
                  onFiltersChange={handleTransactionFiltersChange}
                  filters={transactionFilters}
                  onBulkReview={handleBulkReview}
                  bulkLoading={bulkProcessing}
                />
                <FraudAlerts alerts={dashboardStats?.alerts} logs={dashboardStats?.recentFraudLogs} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <FraudChart
                  chartData={dashboardStats?.chartData || []}
                  trendData={dashboardStats?.hourlyTrend || []}
                  lossAverted={dashboardStats?.stats.lossAverted}
                />
                <CheckoutSimulator users={users} onCreated={() => loadDashboard({ silent: true })} />
              </section>
            </>
          ) : null}

          {activeNav === "Fraud Logs" ? <FraudLogsTable logs={fraudLogs} /> : null}

          {activeNav === "Users" ? (
            <>
              <UsersTable users={users} />
              <CheckoutSimulator users={users} onCreated={() => loadDashboard({ silent: true })} />
            </>
          ) : null}

          {activeNav === "Settings" ? (
            <div className="grid gap-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
                  <h2 className="section-title">System Policy</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl bg-emerald-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Allow
                      </p>
                      <p className="mt-3 text-3xl font-bold text-emerald-700">&lt; 60</p>
                      <p className="mt-2 text-sm text-slate-600">Low-risk transactions pass instantly.</p>
                    </div>
                    <div className="rounded-3xl bg-amber-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Review
                      </p>
                      <p className="mt-3 text-3xl font-bold text-amber-700">60 - 85</p>
                      <p className="mt-2 text-sm text-slate-600">Analysts can approve or reject these rows.</p>
                    </div>
                    <div className="rounded-3xl bg-rose-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                        Block
                      </p>
                      <p className="mt-3 text-3xl font-bold text-rose-700">&gt; 85</p>
                      <p className="mt-2 text-sm text-slate-600">Critical-risk transactions are auto-blocked.</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-100 bg-white/70 p-5">
                    <p className="text-sm font-semibold text-ink">Why buttons looked inactive before</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Approve and Reject only work for rows currently in REVIEW status. If no row is under review,
                      the table now clearly shows Reviewed or No action instead of looking broken.
                    </p>
                  </div>
                </div>

                <CheckoutSimulator users={users} onCreated={() => loadDashboard({ silent: true })} />
              </div>

              <DatasetAnalyzer />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

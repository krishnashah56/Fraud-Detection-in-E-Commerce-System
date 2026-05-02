import { useEffect, useState } from "react";
import { AlertCircle, FlaskConical } from "lucide-react";

import { submitCheckout } from "../api/adminApi";

const initialForm = {
  userId: "",
  amount: "1250",
  ipAddress: "185.81.44.21",
  deviceType: "mobile",
  timeSinceLastOrder: "10"
};

const recommendations = [
  {
    label: "Create review case",
    values: {
      userId: "USR-1001",
      amount: "1100",
      ipAddress: "198.51.100.42",
      deviceType: "desktop",
      timeSinceLastOrder: "6"
    }
  },
  {
    label: "Create block case",
    values: {
      userId: "USR-1002",
      amount: "2600",
      ipAddress: "176.8.55.201",
      deviceType: "mobile",
      timeSinceLastOrder: "4"
    }
  },
  {
    label: "Create safe case",
    values: {
      userId: "USR-1001",
      amount: "120",
      ipAddress: "103.44.22.11",
      deviceType: "desktop",
      timeSinceLastOrder: "240"
    }
  }
];

const CheckoutSimulator = ({ users = [], onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (users.length && !form.userId) {
      setForm((current) => ({ ...current, userId: users[0].userId }));
    }
  }, [users, form.userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePreset = (presetValues) => {
    setForm((current) => ({ ...current, ...presetValues }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await submitCheckout({
        userId: form.userId,
        amount: Number(form.amount),
        ipAddress: form.ipAddress,
        deviceType: form.deviceType,
        timeSinceLastOrder: Number(form.timeSinceLastOrder)
      });

      setMessage(
        `${response.transaction.transactionId} created with ${response.transaction.status} status at ${response.transaction.riskScore}% risk.`
      );
      await onCreated?.();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to simulate checkout."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Checkout Simulator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Generate fresh transactions so dashboard actions do not feel dead.
          </p>
        </div>
        <FlaskConical className="text-accent" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {recommendations.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePreset(preset.values)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-accent hover:text-accent"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-slate-600">
          User
          <select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent"
          >
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.userId} - {user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-600">
          Amount
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm font-medium text-slate-600">
          IP Address
          <input
            name="ipAddress"
            value={form.ipAddress}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm font-medium text-slate-600">
          Device Type
          <select
            name="deviceType"
            value={form.deviceType}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-600 md:col-span-2">
          Time Since Last Order (minutes)
          <input
            name="timeSinceLastOrder"
            type="number"
            min="0"
            value={form.timeSinceLastOrder}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting || !form.userId}
            className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Submitting..." : "Create Transaction"}
          </button>
        </div>
      </form>

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
};

export default CheckoutSimulator;

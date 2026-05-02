import { useState } from "react";
import { BarChart3, FileSpreadsheet, TriangleAlert, Upload } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { analyzeDatasetUpload } from "../api/adminApi";

const chartColors = {
  Allow: "#059669",
  Review: "#f59e0b",
  Block: "#e11d48"
};

const requiredColumns = [
  "transaction_amount",
  "time_since_last_order",
  "ip_mismatch_flag",
  "device_type_encoded",
  "historical_fraud_count"
];

const DatasetAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Pehle CSV ya XLSX file choose karo.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const analysis = await analyzeDatasetUpload(selectedFile);
      setResult(analysis);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Dataset analysis nahi ho paya."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Dataset Analyzer</h2>
          <p className="mt-1 text-sm text-slate-500">
            CSV ya XLSX upload karo. System batch analysis karke bata dega kitne rows
            allow, review, aur block hue.
          </p>
        </div>
        <FileSpreadsheet className="text-accent" />
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white/70 p-5">
        <p className="text-sm font-semibold text-ink">Required columns</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {requiredColumns.map((column) => (
            <span
              key={column}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {column}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-500">
          Sample file available at <code>sample-data/batch-analysis-sample.csv</code>
        </p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <Upload size={18} className="text-accent" />
            <span className="font-medium">Upload CSV / XLSX dataset</span>
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:rounded-2xl file:border-0 file:bg-ink file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-slate-800"
          />
          <p className="mt-3 text-xs text-slate-400">
            {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected yet."}
          </p>
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {uploading ? "Analyzing..." : "Analyze Dataset"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <TriangleAlert className="mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-cyan-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Uploaded Rows
              </p>
              <p className="mt-3 text-3xl font-bold text-ink">{result.dataset.uploadedRows}</p>
              <p className="mt-2 text-sm text-slate-500">{result.dataset.fileName}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Allow / Review / Block
              </p>
              <p className="mt-3 text-3xl font-bold text-ink">
                {result.summary.allowCount} / {result.summary.reviewCount} / {result.summary.blockCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">Batch decision summary</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Avg / Max Risk
              </p>
              <p className="mt-3 text-3xl font-bold text-ink">
                {result.summary.averageRiskScore}% / {result.summary.highestRiskScore}%
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Skipped rows: {result.dataset.skippedRows}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-100 bg-white/70 p-5">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-accent" size={18} />
                <p className="text-sm font-semibold text-ink">Decision mix</p>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {result.chartData.map((entry) => (
                        <Cell key={entry.name} fill={chartColors[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/70 p-5">
              <p className="text-sm font-semibold text-ink">Top risky rows</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-400">
                      <th>Row</th>
                      <th>Risk</th>
                      <th>Decision</th>
                      <th>Amount</th>
                      <th>Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.topRiskRows.map((row) => (
                      <tr key={row.rowNumber} className="bg-slate-50 text-sm">
                        <td className="rounded-l-2xl px-4 py-3 font-semibold text-ink">
                          {row.rowNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-rose-600">{row.riskScore}%</td>
                        <td className="px-4 py-3 text-slate-700">{row.decision}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.features.transactionAmount}
                        </td>
                        <td className="rounded-r-2xl px-4 py-3 text-slate-600">
                          {row.features.timeSinceLastOrder} min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {result.validationErrors.length ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-800">Validation issues</p>
              <div className="mt-3 space-y-2 text-sm text-amber-700">
                {result.validationErrors.map((item) => (
                  <p key={`${item.rowNumber}-${item.reason}`}>
                    Row {item.rowNumber}: {item.reason}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default DatasetAnalyzer;

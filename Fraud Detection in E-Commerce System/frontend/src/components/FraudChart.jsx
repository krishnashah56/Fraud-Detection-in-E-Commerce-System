import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const colors = ["#e11d48", "#0f8b8d"];

const FraudChart = ({ chartData, trendData = [], lossAverted = 0 }) => {
  const formattedLossAverted = Number(lossAverted ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-6 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title">Fraud Intelligence</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fraud distribution and hourly risk trends to validate whether attacks are concentrated at specific times.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold">Loss Averted</p>
          <p className="mt-1 text-lg font-bold text-slate-900">${formattedLossAverted}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 rounded-[24px] bg-white/80 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Fraud vs Legitimate</h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={64}
                  outerRadius={96}
                  paddingAngle={4}
                >
                  {chartData.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-72 rounded-[24px] bg-white/80 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Hourly Risk Trend</h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tickFormatter={(value) => value.slice(11, 16)} minTickGap={20} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, value === 0 ? "" : "Count"]}
                />
                <Legend verticalAlign="top" height={24} />
                <Line type="monotone" dataKey="fraud" name="Risk events" stroke="#e11d48" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="lossAverted" name="Loss averted" stroke="#0f8b8d" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudChart;

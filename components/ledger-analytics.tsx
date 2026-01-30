'use client';

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesData {
  bucket: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryData {
  category: string;
  total: number;
}

interface LedgerAnalyticsProps {
  timeseries: TimeSeriesData[];
  categories: CategoryData[];
  meta: {
    from: string;
    to: string;
    bucket: string;
    kind: string;
  };
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export default function LedgerAnalytics({
  timeseries,
  categories,
  meta,
}: LedgerAnalyticsProps) {
  // Calculate KPI metrics
  const totalIncome = timeseries.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = timeseries.reduce((sum, d) => sum + d.expense, 0);
  const net = totalIncome - totalExpense;
  const daysCount = timeseries.length || 1;
  const avgExpensePerDay = totalExpense / daysCount;

  // Prepare pie chart data - top 8 + other
  const topCategories = categories.slice(0, 8);
  const otherTotal = categories.slice(8).reduce((sum, c) => sum + c.total, 0);
  const pieData =
    otherTotal > 0
      ? [...topCategories, { category: 'Other', total: otherTotal }]
      : topCategories;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Income"
          value={totalIncome.toFixed(2)}
          color="text-green-400"
        />
        <KPICard
          label="Total Expense"
          value={totalExpense.toFixed(2)}
          color="text-red-400"
        />
        <KPICard
          label="Net"
          value={net.toFixed(2)}
          color={net >= 0 ? 'text-blue-400' : 'text-red-400'}
        />
        <KPICard
          label="Avg Expense/Day"
          value={avgExpensePerDay.toFixed(2)}
          color="text-yellow-400"
        />
      </div>

      {/* Time Series Chart */}
      {timeseries.length > 0 && (
        <div className="glass-panel rounded-lg p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Income & Expense ({meta.bucket})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="bucket"
                stroke="var(--text-faint)"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="var(--text-faint)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--glass-strong)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'var(--app-text)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                dot={false}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                dot={false}
                name="Expense"
              />
              {meta.kind === 'both' && (
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  dot={false}
                  name="Net"
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {pieData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className="glass-panel rounded-lg p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-strong)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'var(--app-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="glass-panel rounded-lg p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Category Details
            </h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {pieData.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm text-muted">{cat.category}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {cat.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {timeseries.length === 0 && (
        <div className="glass-panel rounded-lg p-8 text-center">
          <p className="text-muted">
            No data available for the selected date range.
          </p>
        </div>
      )}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  color: string;
}

function KPICard({ label, value, color }: KPICardProps) {
  return (
    <div className="glass-panel rounded-lg p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import metricsData from "../data/repos-metrics.json";

type MetricType = "commits" | "stars" | "loc";

interface MetricConfig {
  key: MetricType;
  label: string;
  color: string;
  dataKey: "totalCommits" | "totalStars" | "totalLinesOfCode";
  yAxisLabel: string;
}

const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "commits",
    label: "Total Commits",
    color: "#2563eb",
    dataKey: "totalCommits",
    yAxisLabel: "Commits",
  },
  {
    key: "stars",
    label: "Total Stars",
    color: "#f59e0b",
    dataKey: "totalStars",
    yAxisLabel: "Stars",
  },
  {
    key: "loc",
    label: "Lines of Code",
    color: "#10b981",
    dataKey: "totalLinesOfCode",
    yAxisLabel: "LOC",
  },
];

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

export const MetricsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("commits");

  const config = METRIC_CONFIGS.find((m) => m.key === selectedMetric)!;
  const formattedData = metricsData.metrics.map((item) => ({
    ...item,
    displayDate: formatDate(item.date),
  }));

  return (
    <section className="section metrics-section">
      <div className="metrics-header">
        <h2>Repository Growth</h2>
        <div className="metric-toggles">
          {METRIC_CONFIGS.map((metric) => (
            <button
              key={metric.key}
              className={`metric-toggle ${selectedMetric === metric.key ? "active" : ""}`}
              onClick={() => setSelectedMetric(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="displayDate" stroke="var(--muted)" style={{ fontSize: "0.85rem" }} />
            <YAxis
              stroke="var(--muted)"
              style={{ fontSize: "0.85rem" }}
              tickFormatter={formatNumber}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "inherit",
              }}
              formatter={(value: number) => [formatNumber(value), config.yAxisLabel]}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="metrics-subtitle">
        {config.key === "commits" && "Total commits across all repositories over the past year."}
        {config.key === "stars" && "Cumulative stars received across all repositories."}
        {config.key === "loc" && "Estimated total lines of code across all repositories."}
      </p>
    </section>
  );
};

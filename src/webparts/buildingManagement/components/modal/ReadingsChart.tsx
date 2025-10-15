import * as React from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Reading } from '../../types';

interface ReadingsChartProps {
  data: Reading[];
}

const ReadingsChart: React.FC<ReadingsChartProps> = ({ data }) => {
  // Aggregate data by month
  const monthlyData = data.slice(1).reduce((acc, reading) => {
    const date = new Date(reading.date);
    // Consistent format for month and year, e.g., "Jul 2024"
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    if (!acc[monthYear]) {
      acc[monthYear] = {
        name: monthYear,
        'Units Consumed': 0,
        // Store a date object for reliable sorting
        dateObj: new Date(date.getFullYear(), date.getMonth(), 1)
      };
    }
    acc[monthYear]['Units Consumed'] += reading.unitsConsumed;
    return acc;
  }, {} as { [key: string]: { name: string; 'Units Consumed': number; dateObj: Date } });

  const chartData = Object.values(monthlyData).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // We need at least one month of consumption data to show a bar chart
  if (chartData.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded">
        <p className="text-muted">Not enough consumption data for monthly trend.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey="Units Consumed" fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ReadingsChart;
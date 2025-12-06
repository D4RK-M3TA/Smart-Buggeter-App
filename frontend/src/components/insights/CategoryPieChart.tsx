import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { categorySpendingData } from '@/lib/mock-data';

export function CategoryPieChart() {
  const total = categorySpendingData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="font-semibold mb-4">Spending by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categorySpendingData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {categorySpendingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 20%, 90%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [
                `$${value.toFixed(2)} (${((value / total) * 100).toFixed(1)}%)`,
                'Spent'
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlySpendingData } from '@/lib/mock-data';

export function SpendingChart() {
  return (
    <div className="stat-card animate-slide-up">
      <h3 className="font-semibold mb-4">Monthly Spending</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlySpendingData}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 20%, 90%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`$${value}`, 'Spent']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="hsl(173, 58%, 39%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSpending)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

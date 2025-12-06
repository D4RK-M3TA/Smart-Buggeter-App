import { mockTransactions } from '@/lib/mock-data';

export function TopMerchants() {
  // Calculate top merchants by total spend
  const merchantSpending = mockTransactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      const merchant = t.merchant;
      acc[merchant] = (acc[merchant] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topMerchants = Object.entries(merchantSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxSpend = topMerchants[0]?.[1] || 0;

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="font-semibold mb-4">Top Merchants</h3>
      <div className="space-y-4">
        {topMerchants.map(([merchant, amount], index) => (
          <div key={merchant} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-4">{index + 1}.</span>
                <span className="font-medium">{merchant}</span>
              </div>
              <span className="font-mono">${amount.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(amount / maxSpend) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

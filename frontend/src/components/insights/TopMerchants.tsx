import { useCurrency } from '@/contexts/CurrencyContext';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  transaction_type: 'debit' | 'credit';
}

interface TopMerchantsProps {
  transactions?: Transaction[];
}

export function TopMerchants({ transactions = [] }: TopMerchantsProps) {
  const { formatCurrency } = useCurrency();
  // Calculate top merchants by total spend
  const merchantSpending = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((acc, t) => {
      const merchant = t.description;
      const amount = Math.abs(parseFloat(t.amount) || 0);
      acc[merchant] = (acc[merchant] || 0) + amount;
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
        {topMerchants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transaction data available</p>
        ) : (
          topMerchants.map(([merchant, amount], index) => (
          <div key={merchant} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-4">{index + 1}.</span>
                <span className="font-medium">{merchant}</span>
              </div>
              <span className="font-mono">{formatCurrency(amount)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(amount / maxSpend) * 100}%` }}
              />
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

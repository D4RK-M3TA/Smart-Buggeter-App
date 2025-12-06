import { cn } from '@/lib/utils';
import { Transaction, categoryLabels, categoryColors } from '@/lib/mock-data';
import { format } from 'date-fns';
import { RefreshCcw } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        <a href="/transactions" className="text-sm text-primary hover:underline">
          View all
        </a>
      </div>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium',
                categoryColors[transaction.category],
                'bg-opacity-20'
              )}>
                {transaction.merchant.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {transaction.merchant}
                  </p>
                  {transaction.isRecurring && (
                    <RefreshCcw className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(transaction.date), 'MMM d')} • {categoryLabels[transaction.category]}
                </p>
              </div>
            </div>
            <span className={cn(
              'font-mono text-sm font-medium',
              transaction.amount > 0 ? 'text-success' : 'text-foreground'
            )}>
              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

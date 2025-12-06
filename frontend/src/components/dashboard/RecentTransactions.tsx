import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  transaction_type: 'debit' | 'credit';
  category?: { name: string; color?: string } | null;
  is_recurring?: boolean;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          transactions.slice(0, 5).map((transaction) => {
            const amount = parseFloat(transaction.amount) || 0;
            const isCredit = transaction.transaction_type === 'credit';
            const displayAmount = isCredit ? amount : -amount;
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-primary/20"
                    style={{ 
                      backgroundColor: transaction.category?.color ? `${transaction.category.color}20` : undefined 
                    }}
                  >
                    {transaction.description.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {transaction.description}
                      </p>
                      {transaction.is_recurring && (
                        <RefreshCcw className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM d')} • {transaction.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'font-mono text-sm font-medium',
                  isCredit ? 'text-success' : 'text-foreground'
                )}>
                  {isCredit ? '+' : ''}${Math.abs(displayAmount).toFixed(2)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

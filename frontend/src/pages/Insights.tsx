import { useQuery } from '@tanstack/react-query';
import { transactionsAPI } from '@/services/api';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryPieChart } from '@/components/insights/CategoryPieChart';
import { TopMerchants } from '@/components/insights/TopMerchants';
import { Loader2 } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function InsightsPage() {
  const { formatCurrency } = useCurrency();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const startDate = `${currentMonth}-01`;
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['transactions', 'summary', startDate, endDate],
    queryFn: () => transactionsAPI.summary({ start_date: startDate, end_date: endDate }),
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'insights'],
    queryFn: () => transactionsAPI.list({ start_date: startDate, end_date: endDate }),
  });

  if (summaryLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalSpent = summary?.data?.total_expenses || 0;
  const transactions = transactionsData?.data?.results || [];
  const debitTransactions = transactions.filter((t: any) => t.transaction_type === 'debit');
  const avgTransaction = debitTransactions.length > 0 ? totalSpent / debitTransactions.length : 0;
  const largestTransaction = debitTransactions.length > 0 
    ? Math.max(...debitTransactions.map((t: any) => Math.abs(parseFloat(t.amount) || 0)))
    : 0;
  
  // Calculate recurring total for tips (using a placeholder for now)
  const recurringTotal = 0; // This would come from recurring API if needed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground mt-1">
          Analyze your spending patterns and trends
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Spending</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Average Transaction</p>
          <p className="text-2xl font-semibold">{formatCurrency(avgTransaction)}</p>
          <p className="text-xs text-muted-foreground mt-1">Per purchase</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Largest Transaction</p>
          <p className="text-2xl font-semibold">{formatCurrency(largestTransaction)}</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={summary?.data?.by_category || []} />
        <CategoryPieChart data={summary?.data?.by_category || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMerchants transactions={transactions} />
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Spending Tips</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary">Reduce dining out</p>
              <p className="text-xs text-muted-foreground mt-1">
                You could save ~{formatCurrency(50)}/month by cooking at home 2 more days/week
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
              <p className="text-sm font-medium text-success">Great job on utilities!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your utility spending is 15% below average
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
              <p className="text-sm font-medium text-warning">Review subscriptions</p>
              <p className="text-xs text-muted-foreground mt-1">
                Review your recurring subscriptions to optimize spending
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

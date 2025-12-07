import { useQuery } from '@tanstack/react-query';
import { transactionsAPI, budgetsAPI, recurringAPI } from '@/services/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { UpcomingRecurring } from '@/components/dashboard/UpcomingRecurring';
import { Wallet, TrendingDown, PiggyBank, RefreshCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const startDate = `${currentMonth}-01`;
  const endDate = format(new Date(), 'yyyy-MM-dd');

  // Fetch transactions summary
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['transactions', 'summary', startDate, endDate],
    queryFn: () => transactionsAPI.summary({ start_date: startDate, end_date: endDate }),
    retry: 1,
  });

  // Fetch recent transactions
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionsAPI.list({ page: 1 }),
    retry: 1,
  });

  // Fetch budgets
  const { data: budgetsData, isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsAPI.list(),
    retry: 1,
  });

  // Fetch recurring payments
  const { data: recurringData, isLoading: recurringLoading, error: recurringError } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => recurringAPI.list(),
    retry: 1,
  });

  if (summaryLoading || transactionsLoading || budgetsLoading || recurringLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Handle errors gracefully
  if (summaryError || transactionsError || budgetsError || recurringError) {
    console.error('Dashboard errors:', { summaryError, transactionsError, budgetsError, recurringError });
  }

  const totalSpent = summary?.data?.total_expenses || 0;
  const totalIncome = summary?.data?.total_income || 0;
  const transactions = transactionsData?.data?.results || [];
  const budgets = Array.isArray(budgetsData?.data?.results) ? budgetsData.data.results : (Array.isArray(budgetsData?.data) ? budgetsData.data : []);
  const recurringPayments = Array.isArray(recurringData?.data?.results) ? recurringData.data.results : (Array.isArray(recurringData?.data) ? recurringData.data : []);

  const budgetUsed = budgets.reduce((sum: number, b: any) => sum + (b.spent || 0), 0);
  const budgetTotal = budgets.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
  const budgetPercentage = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0;

  const recurringTotal = recurringPayments.reduce((sum: number, p: any) => sum + (p.average_amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your financial overview for {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          subtitle="This month"
          icon={TrendingDown}
          trend={{ value: 12, isPositive: false }}
          variant="default"
        />
        <StatCard
          title="Income"
          value={formatCurrency(totalIncome)}
          subtitle="This month"
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Budget Used"
          value={`${budgetPercentage}%`}
          subtitle={`${formatCurrency(budgetUsed)} of ${formatCurrency(budgetTotal)}`}
          icon={PiggyBank}
          variant={budgetPercentage > 80 ? 'warning' : 'primary'}
        />
        <StatCard
          title="Recurring"
          value={formatCurrency(recurringTotal)}
          subtitle={`${recurringPayments.length} subscriptions`}
          icon={RefreshCcw}
          variant="default"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={summary?.data?.by_category || []} />
        <BudgetOverview budgets={budgets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions.slice(0, 10)} />
        <UpcomingRecurring payments={recurringPayments.filter((p: any) => p.is_active)} />
      </div>
    </div>
  );
}

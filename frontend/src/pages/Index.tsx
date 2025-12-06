import { 
  mockTransactions, 
  mockBudgets, 
  mockRecurringPayments 
} from '@/lib/mock-data';
import { StatCard } from '@/components/dashboard/StatCard';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { UpcomingRecurring } from '@/components/dashboard/UpcomingRecurring';
import { Wallet, TrendingDown, PiggyBank, RefreshCcw } from 'lucide-react';

export default function Dashboard() {
  const totalSpent = mockTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = mockTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetUsed = mockBudgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetTotal = mockBudgets.reduce((sum, b) => sum + b.limit, 0);
  const budgetPercentage = Math.round((budgetUsed / budgetTotal) * 100);

  const recurringTotal = mockRecurringPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your financial overview for December 2024
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          subtitle="This month"
          icon={TrendingDown}
          trend={{ value: 12, isPositive: false }}
          variant="default"
        />
        <StatCard
          title="Income"
          value={`$${totalIncome.toFixed(2)}`}
          subtitle="This month"
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Budget Used"
          value={`${budgetPercentage}%`}
          subtitle={`$${budgetUsed.toFixed(0)} of $${budgetTotal}`}
          icon={PiggyBank}
          variant={budgetPercentage > 80 ? 'warning' : 'primary'}
        />
        <StatCard
          title="Recurring"
          value={`$${recurringTotal.toFixed(2)}`}
          subtitle={`${mockRecurringPayments.length} subscriptions`}
          icon={RefreshCcw}
          variant="default"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />
        <BudgetOverview budgets={mockBudgets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={mockTransactions} />
        <UpcomingRecurring payments={mockRecurringPayments} />
      </div>
    </div>
  );
}

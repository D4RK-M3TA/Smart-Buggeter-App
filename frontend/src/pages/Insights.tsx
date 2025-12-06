import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryPieChart } from '@/components/insights/CategoryPieChart';
import { TopMerchants } from '@/components/insights/TopMerchants';
import { mockTransactions, categorySpendingData } from '@/lib/mock-data';

export default function InsightsPage() {
  const totalSpent = categorySpendingData.reduce((sum, c) => sum + c.value, 0);
  const avgTransaction = totalSpent / mockTransactions.filter(t => t.amount < 0).length;
  const largestTransaction = Math.max(...mockTransactions.filter(t => t.amount < 0).map(t => Math.abs(t.amount)));

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
          <p className="text-2xl font-semibold">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Average Transaction</p>
          <p className="text-2xl font-semibold">${avgTransaction.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Per purchase</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Largest Transaction</p>
          <p className="text-2xl font-semibold">${largestTransaction.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />
        <CategoryPieChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMerchants />
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Spending Tips</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary">Reduce dining out</p>
              <p className="text-xs text-muted-foreground mt-1">
                You could save ~$50/month by cooking at home 2 more days/week
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
                You have 5 recurring charges totaling $300.96/month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { mockBudgets } from '@/lib/mock-data';
import { BudgetManager } from '@/components/budgets/BudgetManager';

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground mt-1">
          Set and track your spending limits by category
        </p>
      </div>

      <BudgetManager budgets={mockBudgets} />
    </div>
  );
}

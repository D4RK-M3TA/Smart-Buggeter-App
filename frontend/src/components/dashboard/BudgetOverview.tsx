import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Budget {
  id: string;
  name: string;
  amount: string;
  spent?: number;
  category?: { name: string; color?: string } | null;
}

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const { formatCurrency } = useCurrency();
  
  return (
    <div className="stat-card animate-slide-up">
      <h3 className="font-semibold mb-4">Budget Status</h3>
      <div className="space-y-4">
        {budgets.slice(0, 5).map((budget) => {
          const spent = budget.spent || 0;
          const limit = parseFloat(budget.amount) || 0;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOverBudget = spent > limit;
          
          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {budget.category?.color && (
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: budget.category.color }}
                    />
                  )}
                  <span className="text-foreground">{budget.name}</span>
                </div>
                <span className={cn(
                  'font-mono text-xs',
                  isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  'h-2',
                  isOverBudget && '[&>div]:bg-destructive'
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

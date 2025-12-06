import { cn } from '@/lib/utils';
import { Budget, categoryLabels, categoryColors } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  return (
    <div className="stat-card animate-slide-up">
      <h3 className="font-semibold mb-4">Budget Status</h3>
      <div className="space-y-4">
        {budgets.slice(0, 5).map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isOverBudget = budget.spent > budget.limit;
          
          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', categoryColors[budget.category])} />
                  <span className="text-foreground">{categoryLabels[budget.category]}</span>
                </div>
                <span className={cn(
                  'font-mono text-xs',
                  isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  ${budget.spent.toFixed(0)} / ${budget.limit}
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

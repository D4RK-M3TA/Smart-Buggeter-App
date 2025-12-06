import { useState } from 'react';
import { Budget, categoryLabels, categoryColors, Category } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit2, AlertTriangle, Check } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  onUpdateBudget?: (category: Category, limit: number) => void;
}

export function BudgetManager({ budgets, onUpdateBudget }: BudgetManagerProps) {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newLimit, setNewLimit] = useState('');

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  const handleSave = () => {
    if (editingBudget && newLimit) {
      onUpdateBudget?.(editingBudget.category, parseFloat(newLimit));
      setEditingBudget(null);
      setNewLimit('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-semibold">${totalBudget.toFixed(0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-semibold">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className={cn(
            'text-2xl font-semibold',
            remaining >= 0 ? 'text-success' : 'text-destructive'
          )}>
            ${remaining.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage >= 80 && percentage < 100;

          return (
            <div
              key={budget.category}
              className="stat-card animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    categoryColors[budget.category],
                    'bg-opacity-20'
                  )}>
                    {isOverBudget ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : isNearLimit ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <Check className="h-5 w-5 text-success" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{categoryLabels[budget.category]}</h4>
                    <p className="text-sm text-muted-foreground">
                      {isOverBudget 
                        ? `Over budget by $${(budget.spent - budget.limit).toFixed(2)}`
                        : isNearLimit
                          ? `${(100 - percentage).toFixed(0)}% remaining`
                          : `$${(budget.limit - budget.spent).toFixed(2)} remaining`
                      }
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingBudget(budget);
                        setNewLimit(budget.limit.toString());
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit {categoryLabels[budget.category]} Budget</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="limit">Monthly Limit</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="limit"
                            type="number"
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            className="pl-7"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingBudget(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-mono">${budget.spent.toFixed(2)}</span>
                  <span className="text-muted-foreground font-mono">${budget.limit}</span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={cn(
                    'h-3',
                    isOverBudget && '[&>div]:bg-destructive',
                    isNearLimit && '[&>div]:bg-warning'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

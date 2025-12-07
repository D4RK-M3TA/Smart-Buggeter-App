import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsAPI } from '@/services/api';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Edit2, AlertTriangle, Check, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Budget {
  id: string;
  name: string;
  amount: string;
  spent?: number;
  category?: { name: string; color?: string; id: string } | null;
  period: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface BudgetManagerProps {
  budgets: Budget[];
  categories?: any[];
}

export function BudgetManager({ budgets = [], categories = [] }: BudgetManagerProps) {
  const queryClient = useQueryClient();
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  });

  // Ensure budgets is always an array
  const budgetsArray = Array.isArray(budgets) ? budgets : [];
  
  const totalBudget = budgetsArray.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const totalSpent = budgetsArray.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remaining = totalBudget - totalSpent;

  const createMutation = useMutation({
    mutationFn: (data: any) => budgetsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created');
      setIsCreating(false);
    },
    onError: () => {
      toast.error('Failed to create budget');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => budgetsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated');
      setEditingBudget(null);
      setNewLimit('');
    },
    onError: () => {
      toast.error('Failed to update budget');
    },
  });

  const handleSave = () => {
    if (editingBudget && newLimit) {
      updateMutation.mutate({
        id: editingBudget.id,
        data: { amount: newLimit },
      });
    }
  };

  const handleCreate = () => {
    if (!createFormData.category || !createFormData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());

    createMutation.mutate({
      name: categories.find((c: any) => c.id === createFormData.category)?.name || 'Budget',
      category: createFormData.category,
      amount: createFormData.amount,
      period: createFormData.period,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className={cn(
            'text-2xl font-semibold',
            remaining >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgetsArray.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Budgets</h2>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>
        )}
        
        {/* Create Budget Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-category">Category *</Label>
                <Select
                  value={createFormData.category}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, category: value })}
                >
                  <SelectTrigger id="create-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-amount">Monthly Amount *</Label>
                <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                  <Input
                    id="create-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={createFormData.amount}
                    onChange={(e) => setCreateFormData({ ...createFormData, amount: e.target.value })}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-period">Period</Label>
                <Select
                  value={createFormData.period}
                  onValueChange={(value: any) => setCreateFormData({ ...createFormData, period: value })}
                >
                  <SelectTrigger id="create-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setCreateFormData({ category: '', amount: '', period: 'monthly' });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Budget'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {budgetsArray.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No budgets set up yet</p>
            <Button 
              className="mt-4" 
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          budgetsArray.map((budget) => {
            const limit = parseFloat(budget.amount) || 0;
            const spent = budget.spent || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const isOverBudget = spent > limit;
            const isNearLimit = percentage >= 80 && percentage < 100;
            const categoryName = budget.category?.name || budget.name || 'Uncategorized';
            const categoryColor = budget.category?.color || '#6B7280';

            return (
              <div
                key={budget.id}
                className="stat-card animate-fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      {isOverBudget ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : isNearLimit ? (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      ) : (
                        <Check className="h-5 w-5 text-success" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{categoryName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {isOverBudget 
                          ? `Over budget by ${formatCurrency(spent - limit)}`
                          : isNearLimit
                            ? `${(100 - percentage).toFixed(0)}% remaining`
                            : `${formatCurrency(limit - spent)} remaining`
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
                          setNewLimit(budget.amount);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit {categoryName} Budget</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="limit">Monthly Limit</Label>
                          <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
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
                          <Button variant="outline" onClick={() => {
                            setEditingBudget(null);
                            setNewLimit('');
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">{formatCurrency(spent)}</span>
                    <span className="text-muted-foreground font-mono">{formatCurrency(limit)}</span>
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
          })
        )}
      </div>
    </div>
  );
}

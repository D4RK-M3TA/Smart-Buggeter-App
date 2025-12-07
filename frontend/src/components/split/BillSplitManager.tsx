import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { billsplitAPI } from '@/services/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Check, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BillSplitManagerProps {
  groups?: any[];
  expenses?: any[];
}

export function BillSplitManager({ groups = [], expenses = [] }: BillSplitManagerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { formatCurrency, formatCurrencyWithSign } = useCurrency();
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  // Calculate balances for selected group
  const calculateBalance = () => {
    if (!selectedGroup) {
      return { youOwe: 0, owedToYou: 0, net: 0 };
    }

    const groupExpenses = expenses.filter((e: any) => e.group === selectedGroup);
    let youOwe = 0;
    let owedToYou = 0;

    groupExpenses.forEach((expense: any) => {
      expense.shares?.forEach((share: any) => {
        if (share.user_id === user?.id && !share.is_paid && expense.paid_by !== user?.id) {
          youOwe += parseFloat(share.amount) || 0;
        }
        if (expense.paid_by === user?.id && share.user_id !== user?.id && !share.is_paid) {
          owedToYou += parseFloat(share.amount) || 0;
        }
      });
    });

    return { youOwe, owedToYou, net: owedToYou - youOwe };
  };

  const { youOwe, owedToYou, net } = calculateBalance();

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">You Owe</p>
          <p className="text-2xl font-semibold text-destructive">
            {formatCurrency(youOwe)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Owed to You</p>
          <p className="text-2xl font-semibold text-success">
            {formatCurrency(owedToYou)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={cn(
            'text-2xl font-semibold',
            net >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {formatCurrencyWithSign(net, net >= 0)}
          </p>
        </div>
      </div>

      {/* Add Expense */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Group Expenses</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Group Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Dinner, Uber, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="amount" type="number" placeholder="0.00" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">Participants</Label>
                <Input id="participants" placeholder="Enter names separated by commas" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Expense</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expense List */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="stat-card animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium">{expense.description}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), 'MMM d, yyyy')} • Paid by {expense.paidBy}
                </p>
              </div>
              <span className="text-xl font-semibold font-mono">
                {formatCurrency(expense.amount)}
              </span>
            </div>

            <div className="space-y-2">
              {expense.participants.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{formatCurrency(p.share)}</span>
                    {p.paid ? (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <Check className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {expense.participants.some(p => !p.paid && p.name !== 'You') && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '@/services/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrencyWithSign } from '@/lib/currency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Paperclip, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  transaction_type: 'debit' | 'credit';
  category?: { name: string; color?: string } | null;
  is_recurring?: boolean;
  notes?: string;
  receipt?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate?: () => void;
}

export function TransactionTable({ transactions, onUpdate }: TransactionTableProps) {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => transactionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated');
      onUpdate?.();
    },
    onError: () => {
      toast.error('Failed to update transaction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted');
      onUpdate?.();
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const amount = parseFloat(transaction.amount);
              const isCredit = transaction.transaction_type === 'credit';
              const displayAmount = isCredit ? Math.abs(amount) : -Math.abs(amount);
              
              return (
                <TableRow key={transaction.id} className="group">
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.description}</span>
                      {transaction.is_recurring && (
                        <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {transaction.receipt && (
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    {transaction.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {transaction.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge
                        variant="secondary"
                        className="font-normal"
                        style={{
                          backgroundColor: transaction.category.color 
                            ? `${transaction.category.color}20` 
                            : undefined,
                          color: transaction.category.color || undefined,
                        }}
                      >
                        {transaction.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        Uncategorized
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-mono font-medium',
                      isCredit ? 'text-success' : 'text-foreground'
                    )}>
                      {formatCurrencyWithSign(displayAmount, isCredit, currency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info('Edit functionality coming soon');
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

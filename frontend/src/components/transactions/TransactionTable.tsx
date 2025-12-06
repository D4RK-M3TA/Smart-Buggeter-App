import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '@/services/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="group">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {format(new Date(transaction.date), 'MMM d')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.merchant}</span>
                    {transaction.isRecurring && (
                      <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {transaction.receiptUrl && (
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
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-normal',
                      categoryColors[transaction.category],
                      'bg-opacity-10 hover:bg-opacity-20'
                    )}
                  >
                    {categoryLabels[transaction.category]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    'font-mono font-medium',
                    transaction.amount > 0 ? 'text-success' : 'text-foreground'
                  )}>
                    {transaction.amount > 0 ? '+' : ''}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </p>
    </div>
  );
}

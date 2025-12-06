import { useState } from 'react';
import { Transaction, categoryLabels, categoryColors, Category } from '@/lib/mock-data';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCcw, Paperclip, Edit2, Download } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const csv = [
      ['Date', 'Merchant', 'Category', 'Amount', 'Notes'],
      ...filteredTransactions.map(t => [
        t.date,
        t.merchant,
        categoryLabels[t.category],
        t.amount.toString(),
        t.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
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

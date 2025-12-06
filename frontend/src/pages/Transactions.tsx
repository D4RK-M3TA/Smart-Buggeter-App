import { mockTransactions } from '@/lib/mock-data';
import { TransactionTable } from '@/components/transactions/TransactionTable';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your transactions
        </p>
      </div>

      <TransactionTable transactions={mockTransactions} />
    </div>
  );
}

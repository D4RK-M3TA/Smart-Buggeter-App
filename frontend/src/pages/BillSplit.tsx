import { useQuery } from '@tanstack/react-query';
import { billsplitAPI } from '@/services/api';
import { BillSplitManager } from '@/components/split/BillSplitManager';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BillSplitPage() {
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['billsplit', 'groups'],
    queryFn: () => billsplitAPI.groups.list(),
    enabled: true, // Will be controlled by feature flag
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['billsplit', 'expenses'],
    queryFn: () => billsplitAPI.expenses.list(),
    enabled: true,
  });

  if (groupsLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if bill splitting is enabled (would come from API or env)
  const billSplitEnabled = true; // This should check the feature flag

  if (!billSplitEnabled) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bill splitting feature is currently disabled. Contact your administrator to enable it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bill Splitting</h1>
        <p className="text-muted-foreground mt-1">
          Split expenses with friends and track who owes what
        </p>
      </div>

      <BillSplitManager 
        groups={groupsData?.data || []}
        expenses={expensesData?.data || []}
      />
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { budgetsAPI, categoriesAPI } from '@/services/api';
import { BudgetManager } from '@/components/budgets/BudgetManager';
import { Loader2 } from 'lucide-react';

export default function BudgetsPage() {
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsAPI.list(),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.list(),
  });

  if (budgetsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground mt-1">
          Set and track your spending limits by category
        </p>
      </div>

      <BudgetManager 
        budgets={budgetsData?.data || []} 
        categories={categoriesData?.data || []}
      />
    </div>
  );
}

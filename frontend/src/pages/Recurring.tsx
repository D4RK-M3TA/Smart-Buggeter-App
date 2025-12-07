import { useQuery } from '@tanstack/react-query';
import { recurringAPI } from '@/services/api';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCcw, Pause, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function RecurringPage() {
  const { formatCurrency } = useCurrency();
  const { data: recurringData, isLoading, refetch } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => recurringAPI.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const payments = Array.isArray(recurringData?.data?.results) ? recurringData.data.results : [];
  const activePayments = Array.isArray(payments) ? payments.filter((p: any) => p.is_active !== false) : [];
  const totalMonthly = activePayments.reduce((sum: number, p: any) => sum + (parseFloat(p.average_amount || 0) || 0), 0);
  const totalYearly = totalMonthly * 12;

  const sortedPayments = Array.isArray(activePayments) ? [...activePayments].sort(
    (a: any, b: any) => {
      const dateA = a.next_expected ? new Date(a.next_expected).getTime() : 0;
      const dateB = b.next_expected ? new Date(b.next_expected).getTime() : 0;
      return dateA - dateB;
    }
  ) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recurring Payments</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your subscriptions and recurring charges
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Monthly Total</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Yearly Total</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalYearly)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-2xl font-semibold">{activePayments.length}</p>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {sortedPayments.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No recurring payments detected yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Recurring patterns will be detected automatically from your transactions
            </p>
          </div>
        ) : (
          sortedPayments.map((payment: any) => {
            const nextDate = payment.next_expected || payment.last_occurrence;
            if (!nextDate) return null;
            
            const daysUntil = differenceInDays(new Date(nextDate), new Date());
            const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
            const amount = parseFloat(payment.average_amount) || 0;

            const handleToggle = async () => {
              try {
                await recurringAPI.update(payment.id, { is_active: !payment.is_active });
                toast.success('Recurring payment updated');
                refetch();
              } catch (error) {
                toast.error('Failed to update recurring payment');
              }
            };

            const handleDelete = async () => {
              try {
                await recurringAPI.delete(payment.id);
                toast.success('Recurring payment deleted');
                refetch();
              } catch (error) {
                toast.error('Failed to delete recurring payment');
              }
            };

            return (
              <div key={payment.id} className="stat-card animate-fade-in group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/20"
                      style={{ 
                        backgroundColor: payment.category?.color ? `${payment.category.color}20` : undefined 
                      }}
                    >
                      <RefreshCcw className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{payment.merchant_name || payment.description_pattern}</h4>
                        {isUpcoming && (
                          <Badge variant="secondary" className="bg-warning/10 text-warning text-xs">
                            Due soon
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{payment.category?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span className="capitalize">{payment.frequency || 'monthly'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-mono font-semibold">{formatCurrency(amount)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {daysUntil === 0
                            ? 'Due today'
                            : daysUntil < 0
                              ? 'Overdue'
                              : `${format(new Date(nextDate), 'MMM d')}`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggle}>
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

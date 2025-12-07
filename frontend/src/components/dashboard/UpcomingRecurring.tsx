import { format, differenceInDays } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RecurringPayment {
  id: string;
  merchant_name?: string;
  description_pattern: string;
  average_amount: string;
  next_expected?: string;
  frequency?: string;
  category?: { name: string; color?: string } | null;
  is_active?: boolean;
}

interface UpcomingRecurringProps {
  payments: RecurringPayment[];
}

export function UpcomingRecurring({ payments }: UpcomingRecurringProps) {
  const { formatCurrency } = useCurrency();
  const sortedPayments = [...payments]
    .filter(p => p.next_expected && p.is_active)
    .sort(
      (a, b) => new Date(a.next_expected!).getTime() - new Date(b.next_expected!).getTime()
    );

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upcoming Payments</h3>
        <Link to="/recurring" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {sortedPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming recurring payments</p>
        ) : (
          sortedPayments.slice(0, 4).map((payment) => {
            const daysUntil = differenceInDays(new Date(payment.next_expected!), new Date());
            const amount = parseFloat(payment.average_amount) || 0;
            
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/20"
                    style={{ 
                      backgroundColor: payment.category?.color ? `${payment.category.color}20` : undefined 
                    }}
                  >
                    <Calendar className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {payment.merchant_name || payment.description_pattern}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {daysUntil === 0 
                        ? 'Due today' 
                        : daysUntil < 0 
                          ? 'Overdue'
                          : `In ${daysUntil} days`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {formatCurrency(amount)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payment.next_expected!), 'MMM d')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

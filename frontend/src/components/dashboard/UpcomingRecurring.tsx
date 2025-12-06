import { RecurringPayment, categoryColors } from '@/lib/mock-data';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface UpcomingRecurringProps {
  payments: RecurringPayment[];
}

export function UpcomingRecurring({ payments }: UpcomingRecurringProps) {
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upcoming Payments</h3>
        <a href="/recurring" className="text-sm text-primary hover:underline">
          View all
        </a>
      </div>
      <div className="space-y-3">
        {sortedPayments.slice(0, 4).map((payment) => {
          const daysUntil = differenceInDays(new Date(payment.nextDate), new Date());
          
          return (
            <div
              key={payment.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center',
                  categoryColors[payment.category],
                  'bg-opacity-20'
                )}>
                  <Calendar className="h-4 w-4 text-foreground/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payment.merchant}
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
                  ${payment.amount.toFixed(2)}
                </span>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(payment.nextDate), 'MMM d')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

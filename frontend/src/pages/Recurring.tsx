import { mockRecurringPayments, categoryLabels, categoryColors } from '@/lib/mock-data';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCcw, Pause, Trash2 } from 'lucide-react';

export default function RecurringPage() {
  const totalMonthly = mockRecurringPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalYearly = totalMonthly * 12;

  const sortedPayments = [...mockRecurringPayments].sort(
    (a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );

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
          <p className="text-2xl font-semibold">${totalMonthly.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Yearly Total</p>
          <p className="text-2xl font-semibold">${totalYearly.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-2xl font-semibold">{mockRecurringPayments.length}</p>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {sortedPayments.map((payment) => {
          const daysUntil = differenceInDays(new Date(payment.nextDate), new Date());
          const isUpcoming = daysUntil <= 7 && daysUntil >= 0;

          return (
            <div key={payment.id} className="stat-card animate-fade-in group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-12 w-12 rounded-lg flex items-center justify-center',
                    categoryColors[payment.category],
                    'bg-opacity-20'
                  )}>
                    <RefreshCcw className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{payment.merchant}</h4>
                      {isUpcoming && (
                        <Badge variant="secondary" className="bg-warning/10 text-warning text-xs">
                          Due soon
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{categoryLabels[payment.category]}</span>
                      <span>•</span>
                      <span className="capitalize">{payment.frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-mono font-semibold">${payment.amount.toFixed(2)}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {daysUntil === 0
                          ? 'Due today'
                          : daysUntil < 0
                            ? 'Overdue'
                            : `${format(new Date(payment.nextDate), 'MMM d')}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

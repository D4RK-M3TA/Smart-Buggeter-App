import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn(
            'text-2xl font-semibold tracking-tight',
            variant === 'success' && 'text-success',
            variant === 'warning' && 'text-warning'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          variant === 'primary' && 'bg-primary/10 text-primary',
          variant === 'success' && 'bg-success/10 text-success',
          variant === 'warning' && 'bg-warning/10 text-warning',
          variant === 'default' && 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

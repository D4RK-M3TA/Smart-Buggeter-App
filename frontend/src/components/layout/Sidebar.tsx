import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  Upload,
  PiggyBank,
  BarChart3,
  RefreshCcw,
  Users,
  Settings,
  ChevronLeft,
  Wallet,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SidebarProps {
  billSplitEnabled: boolean;
  onBillSplitToggle: (enabled: boolean) => void;
}

const mainNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/upload', icon: Upload, label: 'Upload CSV' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/recurring', icon: RefreshCcw, label: 'Recurring' },
];

export function Sidebar({ billSplitEnabled, onBillSplitToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">SmartBudget</span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 text-sidebar-foreground', collapsed && 'hidden')}
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {billSplitEnabled && (
            <NavLink
              to="/split"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Bill Split</span>}
            </NavLink>
          )}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-4 space-y-4">
          {!collapsed && (
            <div className="flex items-center justify-between">
              <Label htmlFor="bill-split" className="text-xs text-sidebar-foreground">
                Bill Splitting
              </Label>
              <Switch
                id="bill-split"
                checked={billSplitEnabled}
                onCheckedChange={onBillSplitToggle}
              />
            </div>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 w-full text-sidebar-foreground"
              onClick={() => setCollapsed(false)}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

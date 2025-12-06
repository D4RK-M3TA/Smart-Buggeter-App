import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2,
  Mail,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Profile</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Receive budget alerts via email
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get notified about large transactions
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Summary</p>
              <p className="text-xs text-muted-foreground">
                Receive weekly spending reports
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">
                Update your password regularly
              </p>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-4">
          <Download className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Data</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export All Data</p>
              <p className="text-xs text-muted-foreground">
                Download all your transactions and settings
              </p>
            </div>
            <Button variant="outline" size="sm">Export</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Upload, 
  Bell, 
  Shield, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Receipt,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Landing() {
  const features = [
    {
      icon: Upload,
      title: 'Smart CSV Import',
      description: 'Upload bank statements and automatically categorize transactions with AI-powered machine learning.',
      color: 'text-blue-500'
    },
    {
      icon: PieChart,
      title: 'Visual Insights',
      description: 'Beautiful charts and analytics to understand your spending patterns and financial health.',
      color: 'text-purple-500'
    },
    {
      icon: Target,
      title: 'Budget Management',
      description: 'Set budgets by category and get alerts when you\'re approaching your limits.',
      color: 'text-green-500'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified about recurring payments, budget thresholds, and unusual spending.',
      color: 'text-orange-500'
    },
    {
      icon: Receipt,
      title: 'Receipt Tracking',
      description: 'Attach receipts to transactions and keep all your financial documents organized.',
      color: 'text-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Export your data as CSV, Excel, or PDF for tax preparation and analysis.',
      color: 'text-cyan-500'
    },
  ];

  const benefits = [
    'AI-powered transaction categorization',
    'Automatic recurring payment detection',
    'Real-time budget tracking',
    'Secure and private',
    'Multi-device access',
    'Export to multiple formats'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">SmartBudget</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Personal Finance</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Take Control of Your
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Financial Future
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Smart personal budgeting with AI-powered categorization, automatic transaction tracking, 
            and intelligent insights to help you save more and spend wisely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • Free forever • Your data is private
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to manage your finances effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                    feature.color.replace('text-', 'bg-').replace('-500', '/10')
                  )}>
                    <Icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose SmartBudget?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We make personal finance management simple, intelligent, and secure. 
                Join thousands of users who are taking control of their finances.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <TrendingUp className="h-24 w-24 text-primary mx-auto" />
                  <p className="text-2xl font-bold">Save More</p>
                  <p className="text-muted-foreground">Track smarter, spend less</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold">Your Data is Secure</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We use industry-standard encryption and security practices. 
            Your financial data is private and never shared with third parties.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 md:p-16 text-center text-primary-foreground space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join SmartBudget today and start making smarter financial decisions. 
              It's free, secure, and takes less than a minute to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 h-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">SmartBudget</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SmartBudget. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}




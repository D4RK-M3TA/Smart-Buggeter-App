export type Category = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'entertainment' 
  | 'utilities' 
  | 'health' 
  | 'income' 
  | 'other';

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: Category;
  notes?: string;
  isRecurring?: boolean;
  receiptUrl?: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface RecurringPayment {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  category: Category;
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: { name: string; share: number; paid: boolean }[];
  date: string;
}

export const categoryLabels: Record<Category, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  utilities: 'Utilities & Bills',
  health: 'Health & Medical',
  income: 'Income',
  other: 'Other',
};

export const categoryColors: Record<Category, string> = {
  food: 'bg-orange-500',
  transport: 'bg-blue-500',
  shopping: 'bg-purple-500',
  entertainment: 'bg-pink-500',
  utilities: 'bg-green-500',
  health: 'bg-red-500',
  income: 'bg-emerald-500',
  other: 'bg-gray-500',
};

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-12-05', merchant: 'Whole Foods Market', amount: -127.43, category: 'food', notes: 'Weekly groceries' },
  { id: '2', date: '2024-12-05', merchant: 'Uber', amount: -24.50, category: 'transport' },
  { id: '3', date: '2024-12-04', merchant: 'Netflix', amount: -15.99, category: 'entertainment', isRecurring: true },
  { id: '4', date: '2024-12-04', merchant: 'Amazon', amount: -89.99, category: 'shopping', notes: 'New headphones' },
  { id: '5', date: '2024-12-03', merchant: 'Shell Gas Station', amount: -52.30, category: 'transport' },
  { id: '6', date: '2024-12-03', merchant: 'Salary Deposit', amount: 4250.00, category: 'income' },
  { id: '7', date: '2024-12-02', merchant: 'Spotify', amount: -9.99, category: 'entertainment', isRecurring: true },
  { id: '8', date: '2024-12-02', merchant: 'CVS Pharmacy', amount: -34.56, category: 'health' },
  { id: '9', date: '2024-12-01', merchant: 'Electric Company', amount: -145.00, category: 'utilities', isRecurring: true },
  { id: '10', date: '2024-12-01', merchant: 'Starbucks', amount: -7.25, category: 'food' },
  { id: '11', date: '2024-11-30', merchant: 'Target', amount: -67.89, category: 'shopping' },
  { id: '12', date: '2024-11-29', merchant: 'Gym Membership', amount: -49.99, category: 'health', isRecurring: true },
  { id: '13', date: '2024-11-28', merchant: 'Internet Provider', amount: -79.99, category: 'utilities', isRecurring: true },
  { id: '14', date: '2024-11-27', merchant: 'Restaurant XYZ', amount: -56.78, category: 'food' },
  { id: '15', date: '2024-11-26', merchant: 'Movie Theater', amount: -32.00, category: 'entertainment' },
];

export const mockBudgets: Budget[] = [
  { category: 'food', limit: 500, spent: 191.46 },
  { category: 'transport', limit: 200, spent: 76.80 },
  { category: 'shopping', limit: 300, spent: 157.88 },
  { category: 'entertainment', limit: 100, spent: 57.98 },
  { category: 'utilities', limit: 300, spent: 224.99 },
  { category: 'health', limit: 150, spent: 84.55 },
];

export const mockRecurringPayments: RecurringPayment[] = [
  { id: '1', merchant: 'Netflix', amount: 15.99, frequency: 'monthly', nextDate: '2025-01-04', category: 'entertainment' },
  { id: '2', merchant: 'Spotify', amount: 9.99, frequency: 'monthly', nextDate: '2025-01-02', category: 'entertainment' },
  { id: '3', merchant: 'Electric Company', amount: 145.00, frequency: 'monthly', nextDate: '2025-01-01', category: 'utilities' },
  { id: '4', merchant: 'Gym Membership', amount: 49.99, frequency: 'monthly', nextDate: '2024-12-29', category: 'health' },
  { id: '5', merchant: 'Internet Provider', amount: 79.99, frequency: 'monthly', nextDate: '2024-12-28', category: 'utilities' },
];

export const mockGroupExpenses: GroupExpense[] = [
  {
    id: '1',
    description: 'Dinner at Italian Restaurant',
    amount: 156.80,
    paidBy: 'You',
    participants: [
      { name: 'You', share: 52.27, paid: true },
      { name: 'Alex', share: 52.27, paid: false },
      { name: 'Jordan', share: 52.26, paid: true },
    ],
    date: '2024-12-03',
  },
  {
    id: '2',
    description: 'Uber to Airport',
    amount: 45.00,
    paidBy: 'Alex',
    participants: [
      { name: 'You', share: 15.00, paid: false },
      { name: 'Alex', share: 15.00, paid: true },
      { name: 'Sam', share: 15.00, paid: true },
    ],
    date: '2024-12-01',
  },
];

export const monthlySpendingData = [
  { month: 'Jul', amount: 2340 },
  { month: 'Aug', amount: 2180 },
  { month: 'Sep', amount: 2650 },
  { month: 'Oct', amount: 2420 },
  { month: 'Nov', amount: 2890 },
  { month: 'Dec', amount: 1245 },
];

export const categorySpendingData = [
  { name: 'Food & Dining', value: 191.46, color: 'hsl(25, 95%, 53%)' },
  { name: 'Transportation', value: 76.80, color: 'hsl(199, 89%, 48%)' },
  { name: 'Shopping', value: 157.88, color: 'hsl(280, 65%, 60%)' },
  { name: 'Entertainment', value: 57.98, color: 'hsl(340, 75%, 55%)' },
  { name: 'Utilities', value: 224.99, color: 'hsl(142, 71%, 45%)' },
  { name: 'Health', value: 84.55, color: 'hsl(0, 72%, 51%)' },
];

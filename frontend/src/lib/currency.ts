// Currency utility for formatting and detection

// Currency codes and their symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  ZAR: 'R',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
};

// Currency formatting options
const CURRENCY_FORMATS: Record<string, Intl.NumberFormatOptions> = {
  USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  ZAR: { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  GBP: { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  JPY: { style: 'currency', currency: 'JPY', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  AUD: { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  CAD: { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  CHF: { style: 'currency', currency: 'CHF', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  CNY: { style: 'currency', currency: 'CNY', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  INR: { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

// Detect currency based on user's location
export function detectCurrencyFromLocation(): string {
  try {
    // Try to get timezone to infer location
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // South Africa timezone
    if (timezone.includes('Johannesburg') || timezone.includes('Africa/Johannesburg')) {
      return 'ZAR';
    }
    
    // Try to get locale
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale.includes('en-ZA') || locale.includes('af-ZA') || locale.includes('zu-ZA')) {
      return 'ZAR';
    }
    
    // Default to ZAR for now (as requested)
    return 'ZAR';
  } catch (error) {
    // Default to ZAR if detection fails
    return 'ZAR';
  }
}

// Get currency from user preferences or detect from location
export function getCurrency(): string {
  // Try to get from localStorage (user preference)
  const savedCurrency = localStorage.getItem('currency');
  if (savedCurrency && CURRENCY_SYMBOLS[savedCurrency]) {
    return savedCurrency;
  }
  
  // Detect from location
  return detectCurrencyFromLocation();
}

// Set user's preferred currency
export function setCurrency(currency: string) {
  if (CURRENCY_SYMBOLS[currency]) {
    localStorage.setItem('currency', currency);
  }
}

// Format amount with currency symbol
export function formatCurrency(amount: number | string, currency?: string): string {
  const currencyCode = currency || getCurrency();
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(amountNum)) {
    return `${CURRENCY_SYMBOLS[currencyCode] || 'R'}0.00`;
  }
  
  try {
    const formatter = new Intl.NumberFormat('en-ZA', CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS.ZAR);
    return formatter.format(amountNum);
  } catch (error) {
    // Fallback to simple formatting
    const symbol = CURRENCY_SYMBOLS[currencyCode] || 'R';
    return `${symbol}${Math.abs(amountNum).toFixed(2)}`;
  }
}

// Format amount without symbol (just number)
export function formatAmount(amount: number | string): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(amountNum)) {
    return '0.00';
  }
  return Math.abs(amountNum).toFixed(2);
}

// Get currency symbol
export function getCurrencySymbol(currency?: string): string {
  const currencyCode = currency || getCurrency();
  return CURRENCY_SYMBOLS[currencyCode] || 'R';
}

// Format currency for display (with sign for credits/debits)
export function formatCurrencyWithSign(
  amount: number | string,
  isCredit: boolean = false,
  currency?: string
): string {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = formatCurrency(Math.abs(amountNum), currency);
  const sign = isCredit ? '+' : amountNum < 0 ? '-' : '';
  return `${sign}${formatted}`;
}




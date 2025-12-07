import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrency, setCurrency as setCurrencyStorage, formatCurrency, getCurrencySymbol } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number | string) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(getCurrency());

  const updateCurrency = (newCurrency: string) => {
    setCurrencyStorage(newCurrency);
    setCurrencyState(newCurrency);
  };

  const format = (amount: number | string) => {
    return formatCurrency(amount, currency);
  };

  const getSymbol = () => {
    return getCurrencySymbol(currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: updateCurrency,
        formatCurrency: format,
        getCurrencySymbol: getSymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}




import { useQuery } from "@tanstack/react-query";

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

export function useCurrencyConversion(from: string, to: string, amount: number | string) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;

  const conversionQuery = useQuery({
    queryKey: ['/api/currency/convert', from, to, amount],
    queryFn: async () => {
      if (!from || !to || !isValidAmount) {
        return null;
      }
      
      const response = await fetch(
        `/api/currency/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(numAmount)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to convert currency');
      }
      
      return response.json() as Promise<ConversionResult>;
    },
    enabled: !!from && !!to && isValidAmount,
    refetchOnWindowFocus: false
  });
  
  return {
    conversion: conversionQuery.data,
    isLoading: conversionQuery.isLoading,
    error: conversionQuery.error
  };
}

// Available currencies for the app
export const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "MXN", label: "Mexican Peso (MXN)" },
  { value: "BRZ", label: "Brazilian Real (BRZ)" },
  { value: "AUDD", label: "Australian Dollar (AUDD)" },
  { value: "USDC", label: "USD Coin (USDC)" },
  { value: "EURC", label: "Euro Coin (EURC)" },
];
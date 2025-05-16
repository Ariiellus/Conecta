import { useQuery } from "@tanstack/react-query";
import { TOKEN_ADDRESSES } from "@/config/tokens";

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  fromAddress?: string;
  toAddress?: string;
  networkId?: string;
}

export interface CurrencyInfo {
  value: string;
  label: string;
  networks: {
    [networkId: string]: {
      address: string;
      decimals: number;
    };
  };
}

export function useCurrencyConversion(
  from: string,
  to: string,
  amount: number | string,
  networkId: string = "8453" // Default to Base Network
) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;

  const conversionQuery = useQuery({
    queryKey: ['/api/currency/convert', from, to, amount, networkId],
    queryFn: async () => {
      if (!from || !to || !isValidAmount) {
        return null;
      }
      
      const response = await fetch(
        `/api/currency/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(numAmount)}&networkId=${encodeURIComponent(networkId)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to convert currency');
      }
      
      const data = await response.json() as ConversionResult;
      
      // Add token addresses if available for the network
      if (TOKEN_ADDRESSES[networkId]) {
        if (TOKEN_ADDRESSES[networkId][from]) {
          data.fromAddress = TOKEN_ADDRESSES[networkId][from].address;
        }
        if (TOKEN_ADDRESSES[networkId][to]) {
          data.toAddress = TOKEN_ADDRESSES[networkId][to].address;
        }
        data.networkId = networkId;
      }
      
      return data;
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

// Available currencies for the app with network support
export const CURRENCIES: CurrencyInfo[] = [
  {
    value: "USDC",
    label: "USD Coin (USDC)",
    networks: {
      "8453": {
        address: TOKEN_ADDRESSES["8453"].USDC.address,
        decimals: TOKEN_ADDRESSES["8453"].USDC.decimals
      },
      "5000": {
        address: TOKEN_ADDRESSES["5000"].USDC.address,
        decimals: TOKEN_ADDRESSES["5000"].USDC.decimals
      }
    }
  },
  {
    value: "EURC",
    label: "Euro Coin (EURC)",
    networks: {
      "8453": {
        address: TOKEN_ADDRESSES["8453"].EURC.address,
        decimals: TOKEN_ADDRESSES["8453"].EURC.decimals
      }
    }
  },
  {
    value: "MXN",
    label: "Mexican Peso (MXN)",
    networks: {
      "8453": {
        address: TOKEN_ADDRESSES["8453"].MXN.address,
        decimals: TOKEN_ADDRESSES["8453"].MXN.decimals
      }
    }
  },
  {
    value: "BRZ",
    label: "Brazilian Real (BRZ)",
    networks: {
      "8453": {
        address: TOKEN_ADDRESSES["8453"].BRZ.address,
        decimals: TOKEN_ADDRESSES["8453"].BRZ.decimals
      },
      "5000": {
        address: TOKEN_ADDRESSES["5000"].BRZ.address,
        decimals: TOKEN_ADDRESSES["5000"].BRZ.decimals
      }
    }
  }
];
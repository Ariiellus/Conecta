export interface TokenConfig {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface NetworkTokens {
  [key: string]: TokenConfig;
}

export interface TokenAddresses {
  [networkId: string]: NetworkTokens;
}

export const TOKEN_ADDRESSES: TokenAddresses = {
  // Base Network (8453)
  "8453": {
    USDC: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin"
    },
    MXN: {
      address: "0xa411c9Aa00E020e4f88Bc19996d29c5B7ADB4ACf",
      decimals: 18,
      symbol: "MXN",
      name: "Mexican Peso"
    },
    BRZ: {
      address: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4",
      decimals: 18,
      symbol: "BRZ",
      name: "Brazilian Real"
    },
    EURC: {
      address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
      decimals: 6,
      symbol: "EURC",
      name: "Euro Coin"
    },
    TRY: {
      address: "0x2E9AE768c5B45C7347fAb0cc305B2e1B8F6e24BF",
      decimals: 18,
      symbol: "TRY",
      name: "Turkish Lira"
    },
    ARS: {
      address: "0x7D6632DAbDeA04134F04B2C61E5081e167f1A22d",
      decimals: 18,
      symbol: "ARS",
      name: "Argentine Peso"
    }
  },
  // Mantle Network (5000)
  "5000": {
    USDC: {
      address: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin"
    },
    BRZ: {
      address: "0x05539F021b66Fd01d1FB1ff8E167CdD09bf7c2D0",
      decimals: 18,
      symbol: "BRZ",
      name: "Brazilian Real"
    }
  }
}; 
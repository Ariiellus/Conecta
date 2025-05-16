"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = "cmahs760w009cjs0m89x6h28q";
const PRIVY_CLIENT_ID = "client-WY6LHCQePLM4zFKwVPBoWeJfELxtqhh2wC6mxvNaAZgEF";

export function PrivyClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID || ''}
      clientId={PRIVY_CLIENT_ID || ''}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://your-logo-url",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
} 
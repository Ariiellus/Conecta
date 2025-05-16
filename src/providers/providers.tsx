"use client";

import { useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PRIVY_APP_ID = "cmahs760w009cjs0m89x6h28q";
const PRIVY_CLIENT_ID = "client-WY6LHCQePLM4zFKwVPBoWeJfELxtqhh2wC6mxvNaAZgEF";

if (!PRIVY_APP_ID || !PRIVY_CLIENT_ID) {
  console.error('Missing Privy environment variables. Please check your .env file.');
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={PRIVY_APP_ID || ''}
        clientId={PRIVY_CLIENT_ID || ''}
        config={{
          // Customize Privy's appearance in your app
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
            logo: "https://your-logo-url",
          },
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}
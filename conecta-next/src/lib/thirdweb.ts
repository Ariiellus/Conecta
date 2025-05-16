import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Ethereum } from "@thirdweb-dev/chains";

// Set up the ThirdWeb client
export const thirdwebSDK = new ThirdwebSDK(Ethereum, {
  clientId: process.env.THIRDWEB_CLIENT_ID,
});

// Export the SDK instance
export { ThirdwebSDK }; 
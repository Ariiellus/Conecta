/// <reference types="vite/client" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      THIRDWEB_CLIENT_ID: string;
      THIRDWEB_SECRET_KEY: string;
      DATABASE_URL: string;
    }
  }
} 
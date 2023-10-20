declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      TZ: string;
      GMAIL_PASSWORD: string;
      NEXT_PUBLIC_GMAIL_PASSWORD: string;
      ENCRYPTION_KEY: string;
      NEXT_PUBLIC_ENCRYPTION_KEY: string;
      GLOBAL_KEY: string;
      NEXT_PUBLIC_GLOBAL_KEY: string;
      SECRET_KEY: string;
      NEXT_PUBLIC_SECRET_KEY: string;
      API_KEY: string;
      NEXT_PUBLIC_API_KEY: string;
      MONGODB_URI: string;
      NEXT_PUBLIC_MONGODB_URI: string;
      REDIS_TOKEN: string;
      NEXT_PUBLIC_REDIS_TOKEN: string;
      REDIS_URL: string;
      NEXT_PUBLIC_REDIS_URL: string;
    }
  }
  interface Array<T> {
    /**
     * Sorts the array by priority.
     * @returns A new array of projects sorted by priority.
     */
    sortByPriority(): any[];
  }
}

export {};

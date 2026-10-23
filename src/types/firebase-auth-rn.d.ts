import type { Persistence } from 'firebase/auth';

// firebase/auth の型定義は Web 版のもので、React Native 版にだけある関数が載っていない。
declare module 'firebase/auth' {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}

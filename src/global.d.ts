// Fix global type declarations
interface Window {
  global: typeof globalThis;
  Buffer: typeof Buffer;
}

declare const Buffer: {
  new (str: string, encoding?: string): Buffer;
  from(str: string, encoding?: string): Buffer;
  alloc(size: number): Buffer;
  // Add other Buffer methods if needed
};
/// <reference types="vite/client" />

// FIX: Replaced `declare var process` with a namespace augmentation
// to avoid redeclaring the global `process` variable, which caused a type conflict.
// This correctly adds the `API_KEY` type to the existing `process.env` definition,
// making TypeScript aware of the variable injected by Vite's `define` config.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

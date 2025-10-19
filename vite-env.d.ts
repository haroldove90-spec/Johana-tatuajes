// FIX: The reference to "vite/client" was removed to resolve a type definition error.
// A global `process` variable is declared to support `process.env.API_KEY`,
// which is handled by Vite's `define` config.
declare var process: {
  env: {
    API_KEY: string;
  };
};

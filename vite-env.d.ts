// FIX: Removed `/// <reference types="vite/client" />` because it was causing a "Cannot find type definition file" error.
// This file now globally defines the types for `import.meta.env` for this project.

// This defines the ImportMetaEnv interface to include our custom environment variables.
// This provides TypeScript IntelliSense and type checking for import.meta.env.
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCKING: string;
  readonly VITE_API_PATH: string;
  readonly VITE_COLLECTIONS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

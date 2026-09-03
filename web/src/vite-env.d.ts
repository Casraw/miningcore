/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_API_TARGET?: string;
  readonly VITE_STRATUM_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

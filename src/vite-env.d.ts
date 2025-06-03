/// <reference types="vite/client" />
/// <reference path="./types/vite-plugins.d.ts" />
/// <reference path="./types/global.d.ts" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

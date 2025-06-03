interface ImportMeta {
  env: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    [key: string]: string | boolean | undefined;
  };
}
// Basic Vite types
declare module 'vite' {
  export interface Plugin {
    name: string;
    [key: string]: any;
  }

  export interface UserConfig {
    plugins?: (Plugin | Plugin[] | false | null | undefined)[];
    resolve?: {
      alias?: Record<string, string>;
      [key: string]: any;
    };
    build?: {
      target?: string;
      [key: string]: any;
    };
    optimizeDeps?: {
      include?: string[];
      [key: string]: any;
    };
    server?: {
      host?: string;
      port?: number;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface ConfigEnv {
    command: 'build' | 'serve';
    mode: string;
    [key: string]: any;
  }

  export function defineConfig(config: UserConfig): UserConfig;
  export function defineConfig(fn: (env: ConfigEnv) => UserConfig): (env: ConfigEnv) => UserConfig;
}

// Plugin React SWC
declare module '@vitejs/plugin-react-swc' {
  import type { Plugin } from 'vite';
  
  export interface Options {
    jsxImportSource?: string | boolean;
    [key: string]: any;
  }
  
  export default function(options?: Options): Plugin;
}

// Plugin PWA
declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';
  
  export interface VitePWAOptions {
    registerType?: 'prompt' | 'autoUpdate';
    includeAssets?: string[];
    manifest?: Record<string, any>;
    workbox?: Record<string, any>;
    [key: string]: any;
  }
  
  export function VitePWA(options?: VitePWAOptions): Plugin;
}
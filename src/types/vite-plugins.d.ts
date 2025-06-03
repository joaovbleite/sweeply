// Type definitions for @vitejs/plugin-react-swc version 3.7.1
declare module '@vitejs/plugin-react-swc' {
  import type { Plugin, UserConfig } from 'vite';
  
  export interface Options {
    /** 
     * Enable jsx import source
     * @default false 
     */
    jsxImportSource?: string | boolean;
    
    /** Configure SWC plugins */
    plugins?: any[];
    
    /** Configure SWC */
    swcOptions?: Record<string, any>;
    
    /** Use SWC plugins to transform TypeScript experimental decorators */
    tsDecorators?: boolean;
  }
  
  function reactSWC(options?: Options): Plugin;
  export default reactSWC;
}

// Type definitions for vite-plugin-pwa version 1.0.0
declare module 'vite-plugin-pwa' {
  import type { Plugin, ResolvedConfig } from 'vite';
  import type { GenerateSWOptions } from 'workbox-build';
  
  export interface VitePWAOptions {
    /**
     * Build mode
     * @default 'generateSW'
     */
    mode?: 'generateSW' | 'injectManifest';
    
    /**
     * Register Type
     * @default 'prompt'
     */
    registerType?: 'prompt' | 'autoUpdate';
    
    /**
     * Include assets to precache
     */
    includeAssets?: string[];
    
    /**
     * Manifest options
     */
    manifest?: {
      name?: string;
      short_name?: string;
      description?: string;
      theme_color?: string;
      start_url?: string;
      icons?: Array<{
        src: string;
        sizes: string;
        type: string;
        purpose?: string;
      }>;
      [key: string]: any;
    };
    
    /**
     * Workbox options
     */
    workbox?: Partial<GenerateSWOptions> & {
      /**
       * Maximum file size that can be precached
       */
      maximumFileSizeToCacheInBytes?: number;
      
      /**
       * Runtime caching rules
       */
      runtimeCaching?: Array<{
        urlPattern: RegExp | string;
        handler: string;
        options?: {
          cacheName?: string;
          expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
          };
          cacheableResponse?: {
            statuses: number[];
          };
          [key: string]: any;
        };
      }>;
      
      [key: string]: any;
    };
    
    [key: string]: any;
  }
  
  export function VitePWA(options?: VitePWAOptions): Plugin;
}

// Declare the missing interface for workbox-build
declare module 'workbox-build' {
  export interface GenerateSWOptions {
    swDest: string;
    globDirectory?: string;
    globPatterns?: string[];
    globIgnores?: string[];
    templatedURLs?: Record<string, string | string[]>;
    maximumFileSizeToCacheInBytes?: number;
    dontCacheBustURLsMatching?: RegExp;
    navigateFallback?: string;
    navigateFallbackDenylist?: RegExp[];
    navigateFallbackAllowlist?: RegExp[];
    directoryIndex?: string;
    cacheId?: string;
    clientsClaim?: boolean;
    skipWaiting?: boolean;
    offlineGoogleAnalytics?: boolean | object;
    cleanupOutdatedCaches?: boolean;
    mode?: string;
    navigateFallbackBlacklist?: RegExp[];
    navigateFallbackWhitelist?: RegExp[];
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      options?: Record<string, any>;
    }>;
    [key: string]: any;
  }
}

// Add Vite types for better integration
declare module 'vite' {
  export interface UserConfig {
    plugins?: (Plugin | Plugin[] | false | null | undefined)[];
    [key: string]: any;
  }

  export interface Plugin {
    name: string;
    [key: string]: any;
  }

  export interface ResolvedConfig {
    [key: string]: any;
  }
}
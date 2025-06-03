declare module '@vitejs/plugin-react-swc' {
  export interface Options {
    jsxImportSource?: string;
    plugins?: any[];
    swcOptions?: any;
    tsDecorators?: boolean;
  }

  export default function reactSWC(options?: Options): any;
}

declare module 'vite-plugin-pwa' {
  export interface VitePWAOptions {
    registerType?: 'prompt' | 'autoUpdate';
    includeAssets?: string[];
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
    };
    workbox?: {
      maximumFileSizeToCacheInBytes?: number;
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
        };
      }>;
    };
  }

  export function VitePWA(options?: VitePWAOptions): any;
}
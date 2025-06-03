/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />

/**
 * This file contains additional type declarations to help resolve any missing types.
 */

// Declare module for any packages that might be missing type definitions
declare module 'react-i18next' {
  // Re-export types from the package
  export * from 'react-i18next';
}

declare module 'sonner' {
  // Re-export types from the package
  export * from 'sonner';
}

// If there are any image imports causing issues
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

// For CSS modules if used
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
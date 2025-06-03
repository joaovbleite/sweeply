// Add TypeScript declarations for iOS Safari standalone mode
interface Navigator {
  standalone?: boolean;
}

// Ensure React and JSX types are properly recognized
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
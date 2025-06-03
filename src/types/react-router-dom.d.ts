declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';

  export interface NavigateProps {
    to: string;
    replace?: boolean;
    state?: any;
    children?: ReactNode;
  }

  export const Navigate: ComponentType<NavigateProps>;
  export const useNavigate: () => (to: string, options?: { replace?: boolean, state?: any }) => void;
  export const BrowserRouter: ComponentType<{ children?: ReactNode }>;
  export const Routes: ComponentType<{ children?: ReactNode }>;
  export const Route: ComponentType<{
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }>;
}
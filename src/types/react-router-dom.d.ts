declare module 'react-router-dom' {
  import type { ReactNode, ComponentType, FC } from 'react';

  export interface NavigateProps {
    to: string;
    replace?: boolean;
    state?: any;
    relative?: 'route' | 'path';
    children?: ReactNode;
  }

  export const Navigate: FC<NavigateProps>;
  
  export function useNavigate(): (
    to: string | number, 
    options?: { 
      replace?: boolean; 
      state?: any;
      relative?: 'route' | 'path';
    }
  ) => void;
  
  export const Link: FC<{
    to: string;
    replace?: boolean;
    state?: any;
    relative?: 'route' | 'path';
    reloadDocument?: boolean;
    preventScrollReset?: boolean;
    children?: ReactNode;
    className?: string;
    [prop: string]: any;
  }>;
  
  export const NavLink: typeof Link;
  
  export const BrowserRouter: FC<{
    basename?: string;
    children?: ReactNode;
    window?: Window;
  }>;
  
  export const Routes: FC<{
    children?: ReactNode;
    location?: Partial<Location>;
  }>;
  
  export const Route: FC<{
    path?: string;
    index?: boolean;
    element?: ReactNode;
    children?: ReactNode;
    caseSensitive?: boolean;
    id?: string;
    loader?: (...args: any[]) => any;
    action?: (...args: any[]) => any;
    errorElement?: ReactNode;
  }>;

  export function useLocation(): {
    pathname: string;
    search: string;
    hash: string;
    state: any;
    key: string;
  };

  export function useParams<T extends Record<string, string | undefined>>(): T;
}
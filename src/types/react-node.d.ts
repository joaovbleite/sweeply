declare namespace React {
  // Properly define ReactNode to be compatible with all JSX element types
  type ReactNode = 
    | ReactElement 
    | string 
    | number 
    | ReactFragment 
    | ReactPortal 
    | boolean 
    | null 
    | undefined;
  
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  interface ReactPortal extends ReactElement {
    children: ReactNode;
  }
  
  interface ReactFragment {}
  
  type Key = string | number;
  
  type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);
}
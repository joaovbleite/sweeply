declare module 'react' {
  export * from 'react';
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

  export type Key = string | number;

  export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    displayName?: string;
  }

  export interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
    new(props: P, context?: any): Component<P, S>;
    displayName?: string;
  }

  export type ComponentState = any;

  export interface Component<P, S> {
    props: P;
    state: S;
  }

  export interface StaticLifecycle<P, S> {
  }
}
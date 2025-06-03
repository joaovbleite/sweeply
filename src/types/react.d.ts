declare module 'react' {
  export * from 'react';
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);

  export type Key = string | number;

  export type FC<P = {}> = FunctionComponent<P>;

  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
    propTypes?: any;
  }

  export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

  export interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
    new(props: P, context?: any): Component<P, S>;
    displayName?: string;
    defaultProps?: Partial<P>;
    propTypes?: any;
  }

  export type ComponentState = any;

  export interface Component<P, S> {
    props: P;
    state: S;
    context?: any;
    refs?: {
      [key: string]: any;
    };
  }

  export interface StaticLifecycle<P, S> {
  }

  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }
  
  export interface Provider<T> {
    props: {
      value: T;
      children?: ReactNode;
    };
  }
  
  export interface Consumer<T> {
    props: {
      children: (value: T) => ReactNode;
    };
  }

  export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
  export interface ReactFragment {}
  export interface ReactPortal extends ReactElement {}

  export type DependencyList = ReadonlyArray<any>;
  export type EffectCallback = () => (void | (() => void));
  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type Dispatch<A> = (value: A) => void;
  export type Ref<T> = { current: T | null } | ((instance: T | null) => void);
}
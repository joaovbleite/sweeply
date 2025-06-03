declare module 'react' {
  // React Hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initialArg: I,
    init?: (arg: I) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useRef<T = undefined>(initialValue: T): { current: T };
  export function useLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  export function useImperativeHandle<T, R extends T>(
    ref: React.Ref<T> | undefined,
    init: () => R,
    deps?: React.DependencyList
  ): void;
  export function useDebugValue<T>(value: T, format?: (value: T) => any): void;
  
  // React Context
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  // Event Types
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  
  export interface FormEvent<T = Element> {
    target: T;
    currentTarget: T;
    preventDefault(): void;
  }
}
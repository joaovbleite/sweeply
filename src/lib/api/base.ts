import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Enhanced error types
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

// Enhanced API response type
export interface ApiResponse<T> {
  data: T;
  error: null;
  success: true;
}

export interface ApiErrorResponse {
  data: null;
  error: ApiError;
  success: false;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// Utility functions
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const isNetworkError = (error: any): boolean => {
  return !navigator.onLine || 
         error?.message?.includes('fetch') ||
         error?.message?.includes('network') ||
         error?.code === 'NETWORK_ERROR';
};

export const shouldRetry = (error: any, attempt: number, maxAttempts: number): boolean => {
  if (attempt >= maxAttempts) return false;
  
  // Retry on network errors
  if (isNetworkError(error)) return true;
  
  // Retry on server errors (5xx)
  if (error?.status >= 500) return true;
  
  // Retry on specific Supabase errors
  if (error?.code === 'PGRST301' || error?.code === 'PGRST302') return true;
  
  return false;
};

export const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Enhanced error handler
export const handleSupabaseError = (error: PostgrestError | Error | null): ApiError => {
  if (!error) return new ApiError('Unknown error occurred');
  
  // Network errors
  if (isNetworkError(error)) {
    return new NetworkError();
  }
  
  // Supabase specific errors
  if ('code' in error) {
    const supabaseError = error as PostgrestError;
    
    switch (supabaseError.code) {
      case 'PGRST116':
        return new ValidationError('Invalid request format');
      case 'PGRST301':
        return new ApiError('Service temporarily unavailable', supabaseError.code, 503);
      case '23505':
        return new ValidationError('Duplicate entry - this record already exists');
      case '23503':
        return new ValidationError('Referenced record does not exist');
      case '42501':
        return new AuthenticationError('Insufficient permissions');
      default:
        return new ApiError(
          supabaseError.message || 'Database operation failed',
          supabaseError.code,
          400,
          supabaseError.details
        );
    }
  }
  
  return new ApiError(error.message || 'An unexpected error occurred');
};

// Retry wrapper function
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error, attempt, retryConfig.maxAttempts)) {
        throw handleSupabaseError(error);
      }
      
      if (attempt < retryConfig.maxAttempts) {
        const delay = calculateDelay(attempt, retryConfig);
        console.warn(`API call failed (attempt ${attempt}/${retryConfig.maxAttempts}), retrying in ${delay}ms...`, error);
        await sleep(delay);
      }
    }
  }
  
  throw handleSupabaseError(lastError);
};

// Authentication helper
export const ensureAuthenticated = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new AuthenticationError('User not authenticated');
  }
  
  return user.id;
};

// Data validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
};

export const validatePhone = (phone: string): void => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number format', 'phone');
  }
};

export const validateDate = (date: string, fieldName: string): void => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError(`Invalid date format for ${fieldName}`, fieldName);
  }
};

// Connection status monitoring
export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private listeners: Set<(online: boolean) => void> = new Set();
  private _isOnline: boolean = navigator.onLine;
  
  private constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }
  
  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }
  
  get isOnline(): boolean {
    return this._isOnline;
  }
  
  private handleOnline = (): void => {
    this._isOnline = true;
    this.notifyListeners(true);
  };
  
  private handleOffline = (): void => {
    this._isOnline = false;
    this.notifyListeners(false);
  };
  
  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
  
  addListener(listener: (online: boolean) => void): void {
    this.listeners.add(listener);
  }
  
  removeListener(listener: (online: boolean) => void): void {
    this.listeners.delete(listener);
  }
  
  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners.clear();
  }
}

// Request queue for offline support
export class RequestQueue {
  private static instance: RequestQueue;
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    timestamp: number;
    retries: number;
  }> = [];
  
  private constructor() {
    const monitor = ConnectionMonitor.getInstance();
    monitor.addListener(this.handleConnectionChange);
  }
  
  static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue();
    }
    return RequestQueue.instance;
  }
  
  private handleConnectionChange = (online: boolean): void => {
    if (online) {
      this.processQueue();
    }
  };
  
  add(operation: () => Promise<any>): string {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.queue.push({
      id,
      operation,
      timestamp: Date.now(),
      retries: 0,
    });
    
    if (ConnectionMonitor.getInstance().isOnline) {
      this.processQueue();
    }
    
    return id;
  }
  
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && ConnectionMonitor.getInstance().isOnline) {
      const request = this.queue.shift()!;
      
      try {
        await request.operation();
      } catch (error) {
        request.retries++;
        if (request.retries < 3) {
          this.queue.unshift(request); // Put back at front for retry
        } else {
          console.error('Request failed after 3 retries:', error);
        }
      }
    }
  }
  
  clear(): void {
    this.queue = [];
  }
  
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  static startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      
      const times = this.metrics.get(operation)!;
      times.push(duration);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Log slow operations
      if (duration > 5000) {
        console.warn(`Slow API operation detected: ${operation} took ${duration.toFixed(2)}ms`);
      }
    };
  }
  
  static getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  static getMetrics(): Record<string, { average: number; count: number; max: number; min: number }> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((times, operation) => {
      if (times.length > 0) {
        result[operation] = {
          average: times.reduce((sum, time) => sum + time, 0) / times.length,
          count: times.length,
          max: Math.max(...times),
          min: Math.min(...times),
        };
      }
    });
    
    return result;
  }
  
  static reset(): void {
    this.metrics.clear();
  }
} 
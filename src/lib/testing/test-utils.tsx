import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '@/contexts/AuthContext';
import i18n from '@/lib/i18n';

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn(),
  })),
};

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    phone: '+1234567890',
  },
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock job data
export const mockJob = {
  id: 'test-job-id',
  user_id: 'test-user-id',
  client_id: 'test-client-id',
  title: 'Test Cleaning Job',
  description: 'Test job description',
  service_type: 'regular' as const,
  status: 'scheduled' as const,
  scheduled_date: '2024-01-15',
  scheduled_time: '10:00',
  estimated_duration: 120,
  estimated_price: 150,
  address: '123 Test St, Test City, TS 12345',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  is_recurring: false,
  client: {
    id: 'test-client-id',
    name: 'Test Client',
    email: 'client@example.com',
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip: '12345',
  },
};

// Mock client data
export const mockClient = {
  id: 'test-client-id',
  user_id: 'test-user-id',
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+1234567890',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zip: '12345',
  is_active: true,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock invoice data
export const mockInvoice = {
  id: 'test-invoice-id',
  user_id: 'test-user-id',
  client_id: 'test-client-id',
  invoice_number: 'INV-001',
  status: 'sent' as const,
  issue_date: '2024-01-01',
  due_date: '2024-01-31',
  items: [
    {
      id: 'item-1',
      description: 'Regular Cleaning',
      quantity: 1,
      rate: 150,
      amount: 150,
    },
  ],
  subtotal: 150,
  tax_rate: 0.08,
  tax_amount: 12,
  discount_amount: 0,
  total_amount: 162,
  paid_amount: 0,
  balance_due: 162,
  job_ids: ['test-job-id'],
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  client: mockClient,
};

// Test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode;
  initialUser?: typeof mockUser | null;
  queryClient?: QueryClient;
}

export const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  initialUser = mockUser,
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }),
}) => {
  // Mock auth context value
  const mockAuthValue = {
    user: initialUser,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <AuthProvider value={mockAuthValue}>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: typeof mockUser | null;
  queryClient?: QueryClient;
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialUser, queryClient, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders initialUser={initialUser} queryClient={queryClient}>
      {children}
    </TestProviders>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

// Custom testing utilities
export const waitForLoadingToFinish = () => 
  waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

export const expectElementToBeInDocument = (text: string | RegExp) =>
  expect(screen.getByText(text)).toBeInTheDocument();

export const expectElementNotToBeInDocument = (text: string | RegExp) =>
  expect(screen.queryByText(text)).not.toBeInTheDocument();

// Form testing helpers
export const fillForm = async (fields: Record<string, string>) => {
  const user = userEvent.setup();
  
  for (const [label, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(label, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async (buttonText: string | RegExp = /submit/i) => {
  const user = userEvent.setup();
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
};

// API mocking helpers
export const mockApiSuccess = <T,>(data: T) => ({
  data,
  error: null,
});

export const mockApiError = (message: string, code?: string) => ({
  data: null,
  error: { message, code },
});

// Navigation testing helpers
export const expectToBeOnPage = (path: string) => {
  expect(window.location.pathname).toBe(path);
};

export const navigateToPage = async (linkText: string | RegExp) => {
  const user = userEvent.setup();
  const link = screen.getByRole('link', { name: linkText });
  await user.click(link);
};

// Toast testing helpers
export const expectSuccessToast = (message: string | RegExp) => {
  expect(screen.getByText(message)).toBeInTheDocument();
};

export const expectErrorToast = (message: string | RegExp) => {
  expect(screen.getByText(message)).toBeInTheDocument();
};

// Table testing helpers
export const expectTableToHaveRows = (count: number) => {
  const rows = screen.getAllByRole('row');
  // Subtract 1 for header row
  expect(rows).toHaveLength(count + 1);
};

export const expectTableToContainText = (text: string | RegExp) => {
  const table = screen.getByRole('table');
  expect(table).toHaveTextContent(text);
};

// Modal testing helpers
export const expectModalToBeOpen = (title: string | RegExp) => {
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(title)).toBeInTheDocument();
};

export const expectModalToBeClosed = () => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
};

export const closeModal = async () => {
  const user = userEvent.setup();
  const closeButton = screen.getByRole('button', { name: /close/i });
  await user.click(closeButton);
};

// Date testing helpers
export const formatTestDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export const getTodayString = () => {
  return formatTestDate(new Date());
};

export const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatTestDate(tomorrow);
};

// Async testing helpers
export const waitForApiCall = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForDebounce = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Performance testing helpers
export const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const expectElementToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

export const expectElementToHaveAriaLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAttribute('aria-label', label);
};

// Custom matchers for better assertions
export const customMatchers = {
  toBeValidEmail: (received: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    };
  },
  
  toBeValidPhone: (received: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const pass = phoneRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid phone number`,
      pass,
    };
  },
  
  toBeValidDate: (received: string) => {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid date`,
      pass,
    };
  },
};

// Setup function for tests
export const setupTest = () => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset Supabase mock
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
  
  // Mock successful API responses by default
  mockSupabaseClient.from().single.mockResolvedValue(mockApiSuccess(mockJob));
  mockSupabaseClient.from().then.mockResolvedValue(mockApiSuccess([mockJob]));
};

// Cleanup function for tests
export const cleanupTest = () => {
  jest.restoreAllMocks();
}; 
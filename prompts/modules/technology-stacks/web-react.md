# React.js Technology Stack Module

## Purpose
This module provides comprehensive React.js setup patterns with modern tooling, performance optimization, and production-ready configuration for scalable web applications. It implements TypeScript integration, state management solutions, testing frameworks, and deployment strategies optimized for cost-effectiveness and developer productivity. The module ensures accessibility compliance, internationalization support, and optimal performance across all deployment platforms.

## Instructions

### When to Use This Module
- Building modern single-page applications (SPAs) with React
- Creating component-driven user interfaces with reusable design systems
- Implementing complex state management with Redux Toolkit or Zustand
- Developing applications requiring server-side rendering or static generation
- Building progressive web apps (PWAs) with offline capabilities

### Implementation Steps
1. **Choose Build Tool**: Select Vite for modern projects or Create React App for simpler setups
2. **Configure TypeScript**: Set up strict TypeScript configuration with proper type checking
3. **Set Up State Management**: Choose Redux Toolkit for complex state, Zustand for medium complexity, or Context API for simple state
4. **Implement Routing**: Configure React Router v6 with lazy loading and code splitting
5. **Add Testing Framework**: Set up Jest with React Testing Library for comprehensive testing
6. **Configure Deployment**: Choose Vercel for optimal React deployment or Netlify as alternative

### Key Configuration Decisions
- **Build Tool**: Vite (recommended) for faster development and builds, or CRA for simplicity
- **State Management**: Redux Toolkit for complex apps, Zustand for medium complexity, Context API for simple state
- **UI Framework**: Material-UI for comprehensive components, Chakra UI for simplicity, or Headless UI for custom designs
- **Deployment Platform**: Vercel (recommended) for React-optimized hosting, Netlify for alternative, or AWS for enterprise

### Performance Considerations
- Implement code splitting and lazy loading for optimal bundle sizes
- Use React.memo and useMemo for expensive computations
- Configure proper caching strategies with service workers
- Optimize images and assets with modern formats (WebP, AVIF)
- Implement proper error boundaries and loading states

## Examples

### 1. Complete React Project Setup
```typescript
// vite.config.ts - Optimized Vite configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['@mui/material', '@emotion/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true
  }
});

// tsconfig.json - Strict TypeScript configuration
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2. Advanced State Management with Redux Toolkit
```typescript
// store/index.ts - Complete Redux store setup
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authSlice } from './slices/authSlice';
import { userSlice } from './slices/userSlice';
import { apiSlice } from './api/apiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'] // Only persist specific slices
};

const rootReducer = {
  auth: authSlice.reducer,
  user: userSlice.reducer,
  api: apiSlice.reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/FLUSH', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PERSIST', 'persist/PURGE', 'persist/REGISTER'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks/redux.ts - Typed Redux hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// slices/authSlice.ts - Authentication slice with RTK Query
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api/authAPI';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
```

### 3. Comprehensive Component Architecture
```typescript
// components/common/Button/Button.tsx - Accessible button component
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// components/forms/ContactForm/ContactForm.tsx - Accessible form with validation
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/useToast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm: React.FC = () => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactForm(data);
      toast({
        title: 'Success',
        description: 'Your message has been sent successfully!'
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          className={cn(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.name && 'border-red-500'
          )}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={cn(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.email && 'border-red-500'
          )}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message <span className="text-red-500" aria-label="required">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          className={cn(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.message && 'border-red-500'
          )}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
          {...register('message')}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-sm text-red-500">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};
```

### 4. Performance-Optimized Routing and Code Splitting
```typescript
// router/AppRouter.tsx - Optimized routing with lazy loading
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  </Suspense>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        } />
        
        <Route path="/login" element={
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageWrapper>
              <DashboardPage />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/404" element={
          <PageWrapper>
            <NotFoundPage />
          </PageWrapper>
        } />
        
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// hooks/useRoutePreload.ts - Route preloading hook
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routePreloadMap = {
  '/': () => import('@/pages/DashboardPage'),
  '/login': () => import('@/pages/HomePage'),
  '/dashboard': () => import('@/pages/ProfilePage')
};

export const useRoutePreload = () => {
  const location = useLocation();
  
  useEffect(() => {
    const preloadRoute = routePreloadMap[location.pathname];
    if (preloadRoute) {
      // Preload likely next route
      const timer = setTimeout(() => {
        preloadRoute();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
};
```

### 5. Production-Ready Testing Setup
```typescript
// __tests__/components/Button.test.tsx - Comprehensive component testing
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/common/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('is accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Accessible Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});

// __tests__/hooks/useAuth.test.tsx - Custom hook testing
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

## Technology Stack Configuration

### Core Technologies
- **React**: {{react_version}} (default: 18.x)
- **TypeScript**: Latest stable version for type safety
- **Build Tool**: Vite or Create React App based on project complexity
- **State Management**: Redux Toolkit or Zustand for complex state, Context API for simple state
- **Routing**: React Router v6 with lazy loading and code splitting

### Development Environment
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "@tanstack/react-query": "^4.24.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "typescript": "^4.9.0",
    "eslint": "^8.34.0",
    "@typescript-eslint/eslint-plugin": "^5.52.0",
    "prettier": "^2.8.0"
  }
}
```

## Feature Adaptations

### Authentication Integration
```typescript
// React-specific OAuth implementation
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

const useAuthentication = () => {
  const { user, isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.sub],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const token = await getAccessTokenSilently();
      return fetchUserProfile(token);
    },
    enabled: isAuthenticated
  });
  
  return {
    user: userProfile || user,
    isAuthenticated,
    isLoading,
    login: loginWithRedirect,
    logout: () => logout({ returnTo: window.location.origin })
  };
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthentication();
  
  if (isLoading) {
    return <div aria-live="polite">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### State Management Setup
```typescript
// Redux Toolkit store configuration
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'preferences'] // Only persist specific slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);
```

### Implementation Best Practices

### Performance Optimization
```typescript
// Code splitting and lazy loading
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const LazyDashboard = lazy(() => import('./pages/Dashboard'));
const LazyProfile = lazy(() => import('./pages/Profile'));

// Optimized component with memoization
const OptimizedComponent = React.memo<Props>(({ data, onUpdate }) => {
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  const debouncedUpdate = useCallback(
    debounce((value: string) => onUpdate(value), 300),
    [onUpdate]
  );
  
  return (
    <div>
      <span>{memoizedValue}</span>
      <input onChange={(e) => debouncedUpdate(e.target.value)} />
    </div>
  );
});

// Route-based code splitting
const AppRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={
      <Suspense fallback={<LoadingSpinner />}>
        <ErrorBoundary fallback={<ErrorPage />}>
          <LazyDashboard />
        </ErrorBoundary>
      </Suspense>
    } />
  </Routes>
);
```

## Cost Optimization Strategies

### Bundle Size Optimization
```typescript
// Vite configuration for optimal bundling
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@emotion/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});

// Tree shaking and dead code elimination
import { Button } from '@mui/material'; // ✅ Named import
// import * as MUI from '@mui/material'; // ❌ Avoid namespace imports
```

### CDN and Caching Strategy
```typescript
// Service worker for aggressive caching
const CACHE_NAME = 'react-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Resource hints in HTML
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/api/user-data">
<link rel="preconnect" href="https://api.example.com">
```

## Deployment Configuration

### Vercel Deployment (Recommended for React)
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify Deployment (Alternative)
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Testing Configuration

### Jest and React Testing Library Setup
```typescript
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// Component testing example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};
```

## Accessibility Implementation

### React-Specific Accessibility Patterns
```typescript
// Accessible form component
const AccessibleForm: React.FC = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announce } = useScreenReader();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitForm();
      announce('Form submitted successfully');
    } catch (error) {
      setErrors(error.fieldErrors);
      // Focus first error field
      const firstErrorField = Object.keys(error.fieldErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      announce('Form submission failed. Please check the errors.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>User Information</legend>
        
        <div className="form-group">
          <label htmlFor="email">
            Email Address
            <span aria-label="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <div id="email-error" role="alert" className="error">
              {errors.email}
            </div>
          )}
        </div>
      </fieldset>
    </form>
  );
};
```

## Internationalization Setup

### React i18n Configuration
```typescript
// i18n setup with react-i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

// Usage in components
const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div dir={i18n.dir()}>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description', { name: 'User' })}</p>
    </div>
  );
};
```

## Configuration Variables
- `{{react_version}}` - React version (default: 18.x)
- `{{build_tool}}` - Build tool preference (vite, cra, webpack)
- `{{state_management}}` - State management solution (redux, zustand, context)
- `{{deployment_platform}}` - Deployment platform (vercel, netlify, aws)
- `{{ui_library}}` - UI component library (mui, chakra, antd, headless)

## Dependencies
- React 18+ with TypeScript
- Modern build tools (Vite recommended)
- State management library
- Testing framework (Jest + RTL)
- Deployment platform account
- CDN for static assets

## Documentation Requirements
- Component library documentation (Storybook)
- API integration documentation
- Deployment procedures
- Performance optimization guide
- Accessibility compliance checklist
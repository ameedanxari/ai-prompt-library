# Stage 03 - Architecture: Web Platform Architecture

## Purpose
Define web-specific architecture patterns, technology stack, and implementation strategies that build upon the platform-agnostic foundation.

This stage extends the **Core Architecture Framework** and **System Architecture Patterns** established in the platform-agnostic design, adapting them specifically for web browser environments and web application requirements.

## Instructions
Use this stage to establish the web-specific architecture that implements the platform-agnostic design. Focus on web technologies, browser considerations, performance optimization, and web-specific patterns.

## Examples
```markdown
## Example Web Architecture

### Project: Task Management Web Application
**Architecture**: Server-Side Rendered (SSR) with Next.js
**Frontend**: React 18 + TypeScript + Tailwind CSS
**State Management**: Zustand for client state, SWR for server state
**API Integration**: GraphQL with Apollo Client
**Deployment**: Vercel with edge functions

### Web-Specific Components
- **Service Worker**: Offline caching and background sync
- **PWA Manifest**: Installable web app experience
- **Web Push**: Browser push notifications
- **IndexedDB**: Client-side data persistence
- **Web Workers**: Background processing for heavy tasks
- **Responsive Design**: Mobile-first responsive layouts with CSS Grid and Flexbox
- **Accessibility**: WCAG 2.1 AA compliance with ARIA labels and keyboard navigation
```

## Web Architecture Design

### Frontend Architecture Patterns
```markdown
## Web Frontend Architecture

### Server-Side Rendering (SSR) Architecture
**Technology Stack**: Next.js 14 + React 18 + TypeScript
**Benefits**: SEO optimization, faster initial page load, progressive enhancement
**Implementation Strategy**:
```typescript
// Next.js App Router structure
app/
├── layout.tsx          // Root layout with common elements
├── page.tsx           // Home page
├── globals.css        // Global styles
├── api/               // API routes
│   ├── auth/          // Authentication endpoints
│   ├── tasks/         // Task management endpoints
│   └── users/         // User management endpoints
├── (dashboard)/       // Route groups
│   ├── tasks/         // Task management pages
│   ├── projects/      // Project management pages
│   └── settings/      // User settings pages
└── components/        // Reusable components
    ├── ui/           // Base UI components
    ├── forms/        // Form components
    └── layouts/      // Layout components

// Server Components for data fetching
async function TaskList() {
  const tasks = await fetchTasks(); // Server-side data fetching
  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

// Client Components for interactivity
'use client';
function TaskForm() {
  const [title, setTitle] = useState('');
  const handleSubmit = async (e) => {
    // Client-side form handling
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Single Page Application (SPA) Architecture
**Technology Stack**: Vite + React 18 + TypeScript + React Router
**Benefits**: Rich interactivity, smooth navigation, offline capability
**Implementation Strategy**:
```typescript
// Vite + React SPA structure
src/
├── main.tsx           // Application entry point
├── App.tsx            // Root component with routing
├── components/        // Reusable components
├── pages/            // Page components
├── hooks/            // Custom React hooks
├── services/         // API service layer
├── store/            // State management
├── utils/            // Utility functions
└── types/            // TypeScript type definitions

// React Router setup with lazy loading
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Projects = lazy(() => import('./pages/Projects'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Progressive Web App (PWA) Architecture
**Components**: Service Worker + Web App Manifest + Push Notifications
**Implementation Strategy**:
```typescript
// Service Worker for offline capability
// sw.js
const CACHE_NAME = 'task-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/api/tasks',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Web App Manifest
// manifest.json
{
  "name": "Task Management App",
  "short_name": "TaskApp",
  "description": "Manage your tasks efficiently",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
```

### State Management Architecture
```markdown
## Web State Management Strategy

### Client State Management
#### Zustand (Recommended for Simple to Medium Complexity)
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TaskStore {
  tasks: Task[];
  filter: TaskFilter;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
}

const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        filter: 'all',
        addTask: (task) => 
          set((state) => ({ tasks: [...state.tasks, task] })),
        updateTask: (id, updates) =>
          set((state) => ({
            tasks: state.tasks.map(task =>
              task.id === id ? { ...task, ...updates } : task
            )
          })),
        deleteTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id)
          })),
        setFilter: (filter) => set({ filter }),
      }),
      { name: 'task-store' }
    )
  )
);
```

#### Redux Toolkit (For Complex State Management)
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for API calls
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string) => {
    const response = await api.getTasks(userId);
    return response.data;
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addTask: (state, action) => {
      state.items.push(action.payload);
    },
    updateTask: (state, action) => {
      const { id, updates } = action.payload;
      const task = state.items.find(task => task.id === id);
      if (task) {
        Object.assign(task, updates);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});
```

### Server State Management
#### SWR (Recommended for REST APIs)
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function TaskList() {
  const { data: tasks, error, mutate } = useSWR('/api/tasks', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const addTask = async (newTask: Task) => {
    // Optimistic update
    mutate([...tasks, newTask], false);
    
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
      });
      // Revalidate to get server state
      mutate();
    } catch (error) {
      // Revert optimistic update on error
      mutate();
    }
  };

  if (error) return <div>Failed to load tasks</div>;
  if (!tasks) return <div>Loading...</div>;

  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

#### Apollo Client (For GraphQL APIs)
```typescript
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TASKS = gql`
  query GetTasks($filter: TaskFilter) {
    tasks(filter: $filter) {
      id
      title
      description
      status
      priority
      dueDate
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
    }
  }
`;

function TaskList() {
  const { data, loading, error } = useQuery(GET_TASKS, {
    variables: { filter: { status: 'active' } },
    pollInterval: 30000, // Poll every 30 seconds
  });

  const [createTask] = useMutation(CREATE_TASK, {
    update(cache, { data: { createTask } }) {
      // Update Apollo cache
      cache.modify({
        fields: {
          tasks(existingTasks = []) {
            const newTaskRef = cache.writeFragment({
              data: createTask,
              fragment: gql`
                fragment NewTask on Task {
                  id
                  title
                  description
                  status
                }
              `,
            });
            return [...existingTasks, newTaskRef];
          },
        },
      });
    },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```
```

### Web Performance Architecture
```markdown
## Performance Optimization Strategy

### Bundle Optimization
#### Code Splitting and Lazy Loading
```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));

// Component-based code splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/task/:id" element={<TaskDetail />} />
      </Routes>
    </Suspense>
  );
}

// Dynamic imports for conditional loading
async function loadChartLibrary() {
  if (shouldShowChart) {
    const { Chart } = await import('./components/Chart');
    return Chart;
  }
  return null;
}
```

#### Asset Optimization
```typescript
// Image optimization with Next.js
import Image from 'next/image';

function TaskImage({ task }) {
  return (
    <Image
      src={task.imageUrl}
      alt={task.title}
      width={300}
      height={200}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={task.isPriority}
    />
  );
}

// Font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Caching Strategy
#### Browser Caching
```typescript
// Service Worker caching strategy
const CACHE_STRATEGIES = {
  static: 'cache-first',     // CSS, JS, images
  api: 'network-first',      // API responses
  pages: 'stale-while-revalidate', // HTML pages
};

// HTTP caching headers (Next.js)
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, s-maxage=3600',
    },
  });
}
```

#### Memory Caching
```typescript
// React Query caching
import { useQuery } from '@tanstack/react-query';

function TaskList() {
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return <div>{/* Render tasks */}</div>;
}

// Memoization for expensive calculations
import { useMemo } from 'react';

function TaskStats({ tasks }) {
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => new Date(t.dueDate) < new Date()).length,
    };
  }, [tasks]);

  return <div>{/* Render stats */}</div>;
}
```
```

### Web Security Architecture
```markdown
## Web-Specific Security Implementation

### Content Security Policy (CSP)
```typescript
// Next.js CSP configuration
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com wss://api.example.com;
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={cspHeader} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Authentication Implementation
```typescript
// JWT token management
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const { accessToken, refreshToken } = await response.json();
      this.setTokens(accessToken, refreshToken);
      return true;
    }
    return false;
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Store refresh token in httpOnly cookie (handled by server)
    // Access token in memory only for security
  }

  async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookie
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      this.accessToken = accessToken;
      return accessToken;
    }
    
    // Refresh failed, redirect to login
    this.logout();
    return null;
  }

  getAuthHeader() {
    return this.accessToken ? `Bearer ${this.accessToken}` : null;
  }
}

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await authService.refreshAccessToken();
      if (newToken) {
        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### Cross-Site Request Forgery (CSRF) Protection
```typescript
// CSRF token implementation
export async function generateCSRFToken() {
  const token = crypto.randomUUID();
  // Store token in session or database
  await storeCSRFToken(token);
  return token;
}

export function validateCSRFToken(token: string) {
  // Validate token against stored value
  return isValidCSRFToken(token);
}

// React hook for CSRF protection
function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCSRFToken(data.token));
  }, []);

  return csrfToken;
}

// Form with CSRF protection
function TaskForm() {
  const csrfToken = useCSRFToken();

  const handleSubmit = async (formData: FormData) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```
```

This web-specific architecture builds upon the platform-agnostic foundation to create a robust, performant, and secure web application that follows modern web development best practices.

## Next Steps
- **Stage 04 - Features**: Web-specific feature implementation planning
- **Performance Baseline**: Establish web performance benchmarks
- **Security Audit**: Web security implementation review
- **Browser Testing**: Cross-browser compatibility validation
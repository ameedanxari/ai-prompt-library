# Stage 06 - Implementation: Web Platform Implementation

## Purpose
Define web-specific implementation strategies, development workflows, and deployment processes that build upon the platform-agnostic implementation foundation.

This stage focuses on responsive web development, browser compatibility, web performance optimization, and accessibility implementation while following the core architecture implementation patterns.

## Instructions
Use this stage to establish web-specific implementation practices including frontend build processes, browser compatibility, SEO optimization, and web performance strategies.

## Examples
```markdown
## Example Web Implementation

### Project: Task Management Web Application
**Build Process**: Vite + TypeScript + React
**Testing**: Jest + React Testing Library + Playwright
**Deployment**: Vercel with automatic deployments
**Performance**: Code splitting, lazy loading, service worker caching

### Implementation Workflow
1. Component development with Storybook
2. Unit testing with React Testing Library
3. Integration testing with MSW (Mock Service Worker)
4. E2E testing with Playwright
5. Performance optimization with Lighthouse CI
6. Deployment with preview environments
```

## Implementation Patterns

### Frontend Build Process
```typescript
// Vite configuration for optimal web builds
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```

### Web-Specific Testing
```typescript
// React component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
  };

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('handles task completion', async () => {
    const onUpdate = jest.fn();
    render(<TaskCard task={mockTask} onUpdate={onUpdate} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        id: '1',
        status: 'completed',
      });
    });
  });
});

// E2E testing with Playwright
import { test, expect } from '@playwright/test';

test('user can create and complete tasks', async ({ page }) => {
  await page.goto('/tasks');
  
  // Create new task
  await page.click('[data-testid=new-task-button]');
  await page.fill('[data-testid=task-title]', 'E2E Test Task');
  await page.click('[data-testid=save-task]');
  
  // Verify task appears
  await expect(page.locator('text=E2E Test Task')).toBeVisible();
  
  // Complete task
  await page.click('[data-testid=task-checkbox]');
  await expect(page.locator('[data-testid=completed-task]')).toBeVisible();
});
```

### Web Performance Optimization
```typescript
// Code splitting and lazy loading
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskList = lazy(() => import('./pages/TaskList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </Suspense>
  );
}

// Service Worker for caching
// sw.js
const CACHE_NAME = 'task-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
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
      .then((response) => response || fetch(event.request))
  );
});
```

### SEO and Accessibility Implementation
```typescript
// SEO optimization with Next.js
import Head from 'next/head';
import { GetServerSideProps } from 'next';

export default function TaskPage({ task }: { task: Task }) {
  return (
    <>
      <Head>
        <title>{task.title} - Task Management</title>
        <meta name="description" content={task.description} />
        <meta property="og:title" content={task.title} />
        <meta property="og:description" content={task.description} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://app.example.com/tasks/${task.id}`} />
      </Head>
      
      <main>
        <h1>{task.title}</h1>
        <p>{task.description}</p>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const task = await fetchTask(params?.id as string);
  return { props: { task } };
};

// Accessibility implementation
function AccessibleTaskCard({ task }: { task: Task }) {
  return (
    <article
      role="article"
      aria-labelledby={`task-title-${task.id}`}
      aria-describedby={`task-desc-${task.id}`}
    >
      <h3 id={`task-title-${task.id}`}>{task.title}</h3>
      <p id={`task-desc-${task.id}`}>{task.description}</p>
      
      <button
        aria-label={`Mark "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
        onClick={() => toggleTaskStatus(task.id)}
      >
        {task.status === 'completed' ? '✓' : '○'}
      </button>
    </article>
  );
}
```

### Web Deployment Strategy
```yaml
# GitHub Actions for web deployment
name: Web Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:coverage
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Lighthouse CI
        run: npm run lighthouse:ci

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Next Steps
- **Stage 07 - Deployment**: Web-specific deployment and hosting strategies
- **Performance Monitoring**: Web performance tracking and optimization
- **SEO Optimization**: Search engine optimization implementation
- **Browser Compatibility**: Cross-browser testing and polyfill strategies
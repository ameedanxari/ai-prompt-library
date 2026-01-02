# Stage 04 - Features: Web Platform Implementation

## Purpose
Define web-specific feature implementations, UI components, and user experience patterns that build upon the platform-agnostic feature specifications.

This stage implements responsive design patterns, browser-specific functionality, and web accessibility features while maintaining consistency with the core feature architecture.

## Instructions
Use this stage to specify how the platform-agnostic features will be implemented on the web platform. Focus on web-specific UI patterns, browser capabilities, and web technologies.

## Examples
```markdown
## Example Web Feature Implementation

### Feature: Task Management Web Interface
**UI Framework**: React + TypeScript + Tailwind CSS
**State Management**: Zustand for client state, SWR for server state
**Key Components**: TaskList, TaskCard, TaskForm, TaskFilters
**Web-Specific Features**: 
- Keyboard shortcuts (Ctrl+N for new task)
- Drag-and-drop task reordering
- Browser notifications for due tasks
- Offline task creation with sync

### Implementation
```typescript
// TaskList component with web-specific features
function TaskList() {
  const { data: tasks, mutate } = useSWR('/api/tasks', fetcher);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openNewTaskModal();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="task-list">
      {tasks?.map(task => (
        <TaskCard 
          key={task.id} 
          task={task}
          draggable
          onDragStart={() => setDraggedTask(task)}
        />
      ))}
    </div>
  );
}
```
```

## Web Feature Implementation

### User Interface Components

#### Task Management Interface
```typescript
// Task List Component with Web-Specific Features
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-hot-toast';

interface TaskListProps {
  projectId?: string;
  filter?: TaskFilter;
}

function TaskList({ projectId, filter }: TaskListProps) {
  const { data: tasks, mutate } = useSWR(
    `/api/tasks${projectId ? `?projectId=${projectId}` : ''}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');

  // Keyboard shortcuts
  useHotkeys('ctrl+n, cmd+n', () => openNewTaskModal());
  useHotkeys('ctrl+a, cmd+a', () => selectAllTasks());
  useHotkeys('delete', () => deleteSelectedTasks());
  useHotkeys('ctrl+f, cmd+f', () => focusSearchInput());

  // Drag and drop handling
  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, removed);

    // Optimistic update
    mutate(reorderedTasks, false);

    try {
      await updateTaskOrder(result.draggableId, result.destination.index);
      mutate(); // Revalidate
    } catch (error) {
      toast.error('Failed to reorder tasks');
      mutate(); // Revert on error
    }
  }, [tasks, mutate]);

  // Bulk operations
  const handleBulkAction = async (action: string) => {
    const taskIds = Array.from(selectedTasks);
    
    try {
      switch (action) {
        case 'complete':
          await bulkUpdateTasks(taskIds, { status: 'completed' });
          break;
        case 'delete':
          await bulkDeleteTasks(taskIds);
          break;
        case 'assign':
          // Open assignment modal
          break;
      }
      
      setSelectedTasks(new Set());
      mutate();
      toast.success(`${action} applied to ${taskIds.length} tasks`);
    } catch (error) {
      toast.error(`Failed to ${action} tasks`);
    }
  };

  return (
    <div className="task-list-container">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <TaskFilters filter={filter} onChange={setFilter} />
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedTasks.size > 0 && (
            <BulkActionMenu
              selectedCount={selectedTasks.size}
              onAction={handleBulkAction}
            />
          )}
          <button
            onClick={openNewTaskModal}
            className="btn btn-primary"
            title="New Task (Ctrl+N)"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Task List */}
      {viewMode === 'list' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {tasks?.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <TaskCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        task={task}
                        selected={selectedTasks.has(task.id)}
                        onSelect={(selected) => {
                          const newSelection = new Set(selectedTasks);
                          if (selected) {
                            newSelection.add(task.id);
                          } else {
                            newSelection.delete(task.id);
                          }
                          setSelectedTasks(newSelection);
                        }}
                        isDragging={snapshot.isDragging}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {viewMode === 'board' && (
        <TaskBoard tasks={tasks} onTaskUpdate={mutate} />
      )}

      {viewMode === 'calendar' && (
        <TaskCalendar tasks={tasks} onTaskUpdate={mutate} />
      )}
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  isDragging?: boolean;
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, selected, onSelect, isDragging, ...props }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Double-click to edit
    const handleDoubleClick = () => {
      setIsEditing(true);
    };

    // Context menu
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      // Show context menu
    };

    return (
      <div
        ref={ref}
        {...props}
        className={`
          task-card p-4 bg-white rounded-lg border shadow-sm
          hover:shadow-md transition-shadow cursor-pointer
          ${selected ? 'ring-2 ring-blue-500' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h3>
              <TaskPriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />
            </div>
            
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              {task.dueDate && (
                <span className={`
                  ${isOverdue(task.dueDate) ? 'text-red-600' : ''}
                `}>
                  Due {formatDate(task.dueDate)}
                </span>
              )}
              
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <UserAvatar user={task.assignee} size="xs" />
                  <span>{task.assignee.name}</span>
                </div>
              )}
              
              {task.comments?.length > 0 && (
                <span className="flex items-center space-x-1">
                  <ChatIcon className="w-3 h-3" />
                  <span>{task.comments.length}</span>
                </span>
              )}
            </div>
          </div>
          
          <TaskActions task={task} onUpdate={mutate} />
        </div>
      </div>
    );
  }
);
```

#### Project Management Interface
```typescript
// Project Dashboard Component
function ProjectDashboard({ projectId }: { projectId: string }) {
  const { data: project } = useSWR(`/api/projects/${projectId}`, fetcher);
  const { data: tasks } = useSWR(`/api/tasks?projectId=${projectId}`, fetcher);
  const { data: members } = useSWR(`/api/projects/${projectId}/members`, fetcher);

  const stats = useMemo(() => {
    if (!tasks) return null;
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => isOverdue(t.dueDate)).length,
    };
  }, [tasks]);

  return (
    <div className="project-dashboard">
      {/* Project Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project?.color || '#3B82F6' }}
            >
              <span className="text-white text-xl font-bold">
                {project?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project?.name}
              </h1>
              <p className="text-gray-600">{project?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ProjectMemberAvatars members={members} />
            <button className="btn btn-outline">
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Invite
            </button>
            <button className="btn btn-outline">
              <CogIcon className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Tasks"
          value={stats?.total || 0}
          icon={<ClipboardListIcon />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats?.completed || 0}
          icon={<CheckCircleIcon />}
          color="green"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={<ClockIcon />}
          color="yellow"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdue || 0}
          icon={<ExclamationTriangleIcon />}
          color="red"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Task Progress</h3>
          <TaskProgressChart tasks={tasks} />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Team Activity</h3>
          <TeamActivityChart projectId={projectId} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <ActivityFeed projectId={projectId} />
      </div>
    </div>
  );
}
```

### Web-Specific Features

#### Progressive Web App (PWA) Features
```typescript
// Service Worker for Offline Support
// sw.js
const CACHE_NAME = 'task-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync offline actions when connection is restored
  const offlineActions = await getOfflineActions();
  
  for (const action of offlineActions) {
    try {
      await syncAction(action);
      await removeOfflineAction(action.id);
    } catch (error) {
      console.error('Failed to sync action:', error);
    }
  }
}

// Offline Task Creation
function useOfflineTaskCreation() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const createTask = async (taskData: Partial<Task>) => {
    if (isOnline) {
      // Online: Create task immediately
      return await api.createTask(taskData);
    } else {
      // Offline: Store for later sync
      const offlineTask = {
        ...taskData,
        id: generateOfflineId(),
        createdAt: new Date(),
        offline: true,
      };
      
      await storeOfflineAction({
        type: 'CREATE_TASK',
        data: offlineTask,
        timestamp: Date.now(),
      });
      
      // Register background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      }
      
      return offlineTask;
    }
  };
  
  return { createTask, isOnline };
}
```

#### Browser Notifications
```typescript
// Web Push Notifications
class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  
  async initialize() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.registration = await navigator.serviceWorker.ready;
    }
  }
  
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }
    
    if (!this.registration) {
      return null;
    }
    
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      
      // Send subscription to server
      await api.subscribeToPush(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  
  showNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    }
  }
  
  // Show notification for due tasks
  showTaskDueNotification(task: Task) {
    this.showNotification(`Task Due: ${task.title}`, {
      body: task.description || 'A task is due soon',
      tag: `task-due-${task.id}`,
      actions: [
        {
          action: 'complete',
          title: 'Mark Complete',
        },
        {
          action: 'snooze',
          title: 'Snooze 1 hour',
        },
      ],
    });
  }
}

// Usage in React component
function useNotifications() {
  const [notificationService] = useState(() => new NotificationService());
  const [permission, setPermission] = useState(Notification.permission);
  
  useEffect(() => {
    notificationService.initialize();
  }, []);
  
  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(Notification.permission);
    
    if (granted) {
      await notificationService.subscribeToPush();
    }
    
    return granted;
  };
  
  return {
    permission,
    requestPermission,
    showNotification: notificationService.showNotification.bind(notificationService),
    showTaskDueNotification: notificationService.showTaskDueNotification.bind(notificationService),
  };
}
```

#### Keyboard Shortcuts and Accessibility
```typescript
// Keyboard Shortcuts Hook
function useKeyboardShortcuts() {
  // Global shortcuts
  useHotkeys('ctrl+n, cmd+n', () => {
    // New task
    document.dispatchEvent(new CustomEvent('open-new-task-modal'));
  });
  
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    // Command palette
    document.dispatchEvent(new CustomEvent('open-command-palette'));
  });
  
  useHotkeys('ctrl+/, cmd+/', () => {
    // Show shortcuts help
    document.dispatchEvent(new CustomEvent('show-shortcuts-help'));
  });
  
  useHotkeys('g t', () => {
    // Go to tasks
    window.location.href = '/tasks';
  });
  
  useHotkeys('g p', () => {
    // Go to projects
    window.location.href = '/projects';
  });
}

// Command Palette Component
function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Command[]>([]);
  
  useEffect(() => {
    const handleOpenCommandPalette = () => setIsOpen(true);
    document.addEventListener('open-command-palette', handleOpenCommandPalette);
    return () => document.removeEventListener('open-command-palette', handleOpenCommandPalette);
  }, []);
  
  useEffect(() => {
    if (query) {
      const searchResults = searchCommands(query);
      setResults(searchResults);
    } else {
      setResults(getRecentCommands());
    }
  }, [query]);
  
  const handleExecuteCommand = (command: Command) => {
    command.execute();
    setIsOpen(false);
    setQuery('');
  };
  
  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="command-palette">
        <input
          type="text"
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 text-lg border-0 focus:ring-0"
          autoFocus
        />
        
        <div className="max-h-96 overflow-y-auto">
          {results.map((command, index) => (
            <button
              key={command.id}
              onClick={() => handleExecuteCommand(command)}
              className="w-full p-3 text-left hover:bg-gray-100 flex items-center space-x-3"
            >
              <command.icon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium">{command.title}</div>
                <div className="text-sm text-gray-500">{command.description}</div>
              </div>
              {command.shortcut && (
                <div className="ml-auto text-xs text-gray-400">
                  {command.shortcut}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

// Accessibility Features
function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  
  useEffect(() => {
    // Detect user preferences
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setHighContrast(prefersHighContrast);
    setReducedMotion(prefersReducedMotion);
    
    // Apply CSS classes
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    document.documentElement.classList.toggle(`font-size-${fontSize}`, true);
  }, [highContrast, reducedMotion, fontSize]);
  
  const accessibilityContext = {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
  };
  
  return (
    <AccessibilityContext.Provider value={accessibilityContext}>
      {children}
    </AccessibilityContext.Provider>
  );
}
```

This web-specific feature implementation provides a comprehensive foundation for building modern, accessible, and performant web applications with rich user interactions and offline capabilities.

## Next Steps
- **Stage 05 - Testing**: Web-specific testing strategies and browser compatibility
- **Performance Optimization**: Web performance benchmarking and optimization
- **SEO Implementation**: Search engine optimization and metadata management
- **Browser Compatibility**: Cross-browser testing and polyfill strategies
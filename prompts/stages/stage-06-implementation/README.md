# Stage 06 - Implementation

## Purpose
Create detailed implementation plans, task lists, and development workflows for systematic feature development.

## Inputs
- Testing strategy (Stage 05)
- Feature specifications and architecture
- Development team structure and preferences

## Outputs
- `platform-agnostic.md` - Core implementation strategy
- `web.md` - Web development implementation plan
- `mobile.md` - Mobile development implementation plan
- Context-agnostic task lists and development workflows
- Implementation prompts and guidance documents

## Prerequisites
- Stage 05 (Testing) completed
- Development approach defined

## Next Stage
Stage 07 - Deployment (Deployment configuration and procedures)

## Instructions

### How to Execute Stage 06 - Implementation

1. **Review Previous Stage Outputs**
   - Analyze testing strategy from Stage 05
   - Review feature specifications and architecture decisions
   - Understand development team structure and capabilities
   - Identify any technical constraints or requirements

2. **Create Platform-Agnostic Implementation Strategy**
   - Define core development principles and patterns
   - Establish shared libraries and common functionality
   - Plan data models and API contracts
   - Design integration points between platforms

3. **Develop Platform-Specific Implementation Plans**
   - Create detailed web development roadmap
   - Plan mobile development approach (native or cross-platform)
   - Define desktop implementation if applicable
   - Ensure consistency across all platforms

4. **Generate Context-Agnostic Task Lists**
   - Break down features into manageable development tasks
   - Create self-contained task descriptions with clear acceptance criteria
   - Establish task dependencies and sequencing
   - Include testing and quality assurance tasks

5. **Create Development Workflows**
   - Define code review processes and standards
   - Establish branching strategy and deployment pipeline
   - Plan integration testing and continuous deployment
   - Set up monitoring and error tracking

6. **Prepare Implementation Guidance**
   - Create coding standards and best practices documentation
   - Develop troubleshooting guides and common solutions
   - Establish communication protocols for development team
   - Plan knowledge sharing and documentation processes

### Templates

This module includes the following templates:

## Integration with Other Stages

- **From Stage 05**: Use testing strategy to inform implementation approach
- **To Stage 07**: Provide implementation details for deployment planning
- **Cross-Platform Coordination**: Ensure consistent implementation across all platforms
- **Quality Assurance**: Integrate testing requirements into implementation tasks

## Examples

### Complete Implementation Stage Example

Here's a comprehensive example of executing Stage 06 for a task management application:

#### 1. Implementation Strategy Overview
```markdown
# TaskFlow Implementation Strategy

## Project Context
- **Application**: Task Management SaaS Platform
- **Platforms**: Web (React), Mobile (React Native), API (Node.js)
- **Team**: 6 developers (2 frontend, 2 mobile, 2 backend)
- **Timeline**: 12 weeks development, 2 weeks testing
- **Architecture**: Microservices with shared database

## Core Implementation Principles

### 1. Shared Foundation
- **API-First Development**: All features start with API design
- **Component Reusability**: Shared UI components across web and mobile
- **Consistent Data Models**: Unified data structures across all platforms
- **Progressive Enhancement**: Core functionality works everywhere, enhanced features where supported

### 2. Development Standards
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing Requirements**: 80% code coverage, integration tests for all APIs
- **Documentation**: JSDoc for all public APIs, README for each module
- **Performance**: Core Web Vitals compliance, mobile app startup < 3 seconds

### 3. Platform Strategy
- **Web**: React 18 with Next.js, Tailwind CSS, React Query
- **Mobile**: React Native with Expo, shared business logic
- **Backend**: Node.js with Express, PostgreSQL, Redis for caching
- **Shared**: TypeScript interfaces, validation schemas, utility functions
```

#### 2. Platform-Agnostic Implementation Plan
```markdown
# Core Implementation Components

## 1. Shared Type Definitions
```typescript
// types/Task.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

## 2. API Contract Definitions
```typescript
// api/tasks.ts
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
  assigneeId?: string;
}

export interface TasksResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    assigneeId?: string;
    projectId?: string;
  };
}
```

## 3. Shared Business Logic
```typescript
// utils/taskUtils.ts
export class TaskValidator {
  static validateTitle(title: string): ValidationResult {
    if (!title || title.trim().length === 0) {
      return { valid: false, error: 'Title is required' };
    }
    if (title.length > 200) {
      return { valid: false, error: 'Title must be less than 200 characters' };
    }
    return { valid: true };
  }

  static validateDueDate(dueDate: Date): ValidationResult {
    if (dueDate < new Date()) {
      return { valid: false, error: 'Due date cannot be in the past' };
    }
    return { valid: true };
  }

  static calculateTaskProgress(tasks: Task[]): TaskProgress {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    
    return {
      total,
      completed,
      inProgress,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }
}
```
```

This comprehensive implementation stage example demonstrates how to systematically plan and execute development across multiple platforms while maintaining quality, consistency, and team coordination.
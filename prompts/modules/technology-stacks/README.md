# Technology Stacks Module

## Purpose

Technology-specific modules that adapt features and architecture to different technology stacks and deployment platforms. These modules provide production-ready configurations, cost-optimized deployment strategies, and platform-specific best practices for building scalable applications across web, mobile, and backend technologies.

## Modules

- `tailwind-css.md` - Tailwind CSS theme/token implementation guidance for web UI.
- `mobile-os-capability-matrix.md` - iOS/Android support, permission,
  fallback, and store-policy mapping for OS-controlled features.
- `cloud-gcp.md` - Google Cloud architecture patterns for Cloud Run,
  Cloud SQL/Spanner, Pub/Sub, Cloud Storage, BigQuery, VPC Service
  Controls, Cloud KMS/CMEK, Cloud Armor, IAM, observability, and DR.

## Instructions

1. **Analyze Requirements**: Review project requirements to determine appropriate technology stack
2. **Select Primary Stack**: Choose main technology based on team expertise and project needs
3. **Configure Environment**: Set up development environment with recommended tooling
4. **Apply Best Practices**: Implement security, performance, and accessibility standards
5. **Set Up Deployment**: Configure cost-optimized deployment pipeline
6. **Enable Monitoring**: Implement observability and performance monitoring
7. **Document Decisions**: Record technology choices and rationale

## Examples

### Example 1: Full-Stack Web Application
```typescript
// Frontend: React with TypeScript
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Backend: Node.js with Express
const app = express();
app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});

// Database: PostgreSQL with Redis cache
const cacheKey = 'users:list';
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### Example 2: Python API with Data Science
```python
# Backend: FastAPI with async support
from fastapi import FastAPI
import pandas as pd
import numpy as np

app = FastAPI()

@app.get("/api/analytics")
async def get_analytics():
    # Data processing with pandas
    df = pd.read_sql("SELECT * FROM events", connection)
    return {"insights": df.describe().to_dict()}

# Data Science: Streamlit dashboard
import streamlit as st
st.title("Analytics Dashboard")
chart_data = pd.DataFrame(np.random.randn(20, 3), columns=['a', 'b', 'c'])
st.line_chart(chart_data)

# Database: PostgreSQL with SQLAlchemy
from sqlalchemy import create_engine
engine = create_engine("postgresql://user:pass@localhost/db")
```

### Example 4: Progressive Web App
```javascript
// Service worker with comprehensive caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed'));
}

// Push notifications and offline functionality
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request);
};

// App installation and native-like features
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
  showInstallButton();
});
```

### Example 5: Go Microservices
```go
// High-performance gRPC microservice
type UserService struct {
    pb.UnimplementedUserServiceServer
    repo repository.UserRepository
}

func (s *UserService) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.repo.GetByID(ctx, req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user not found: %v", err)
    }
    return user.ToProto(), nil
}

// Event-driven architecture with NATS
func (h *OrderHandler) HandleOrderCreated(ctx context.Context, event OrderCreatedEvent) error {
    return h.orderService.ProcessOrder(ctx, event.OrderID)
}
```

### Example 6: Mobile-First Application
```typescript
// Mobile: React Native with Expo
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

// Backend: Python with FastAPI
from fastapi import FastAPI
app = FastAPI()

@app.get("/api/data")
async def get_data():
    return {"data": "value"}

// Cloud: Google Cloud Platform
// - Cloud Run for API
// - Cloud SQL for database
// - Cloud Storage for media
```

### Example 7: Enterprise SaaS Platform
```typescript
// Frontend: Next.js with Server-Side Rendering
export default function Dashboard() {
  return <div>Enterprise Dashboard</div>;
}

// Backend: Microservices with Node.js
// - API Gateway for routing
// - Service mesh for communication
// - Event-driven architecture

// Database: Multi-database strategy
// - PostgreSQL for transactional data
// - MongoDB for analytics
// - Redis for caching
```

## Templates

### Mobile Development
- **mobile-react-native.md** - React Native setup and configuration
- **mobile-flutter.md** - Flutter setup and configuration
- **mobile-native.md** - Native iOS/Android development

### Web Development
- **web-react.md** - React.js application setup
- **progressive-web-apps.md** - PWA with offline functionality, push notifications, and native-like features
- **web-nextjs.md** - Next.js full-stack setup
- **web-vue.md** - Vue.js application setup

### Backend Development
- **backend-firebase.md** - Firebase Auth/Firestore/Cloud Functions production patterns
- **backend-nodejs.md** - Node.js and Express setup
- **python-ecosystem.md** - Python (Django, FastAPI, Flask) comprehensive setup
- **go-microservices.md** - Go microservices with gRPC, NATS, and cloud-native patterns
- **java-spring-boot.md** - Java Spring Boot enterprise applications with security, JPA, and microservices
- **dotnet-ecosystem.md** - .NET Core/ASP.NET Core with Entity Framework, authentication, and enterprise patterns
- **ruby-on-rails.md** - Ruby on Rails with Hotwire, Action Cable, background jobs, and comprehensive testing
- **php-ecosystem.md** - PHP (Laravel, Symfony) with Eloquent ORM, authentication, and modern development practices

### Systems Programming & High-Performance
- **rust-systems-programming.md** - Rust for high-performance systems, WebAssembly, concurrent processing, and memory-safe programming
- **cpp-high-performance.md** - C++ for high-performance computing, SIMD operations, real-time systems, and GPU acceleration

### Mobile Development

#### iOS Development
- **swift-ios-development.md** - Swift iOS development with SwiftUI, Combine, Core Data, and iOS-specific features
- **ios-ui-ux-patterns.md** - iOS UI/UX patterns with Human Interface Guidelines, accessibility, dark mode, and adaptive layouts
- **ios-testing-comprehensive.md** - Comprehensive iOS testing with XCTest, XCUITest, snapshot testing, and CI/CD integration
- **ios-deployment-distribution.md** - iOS deployment and distribution with App Store, TestFlight, code signing, and Fastlane
- **ios-performance-optimization.md** - iOS performance optimization with Instruments, memory management, and battery efficiency

#### Android Development
- **kotlin-android-development.md** - Kotlin Android development with Jetpack Compose, Coroutines, Room, and Android architecture

### Functional Programming & Distributed Systems
- **scala-functional-programming.md** - Scala functional programming with Cats Effect, Akka actors, Play Framework, and reactive systems
- **elixir-phoenix-web.md** - Elixir/Phoenix for fault-tolerant web applications, OTP patterns, LiveView, and distributed computing

### Cloud Platforms
- **cloud-aws.md** - AWS services and deployment
- **cloud-gcp.md** - Google Cloud Platform setup
- **cloud-azure.md** - Microsoft Azure setup

### Databases
- **database-postgresql.md** - PostgreSQL setup and optimization
- **database-mongodb.md** - MongoDB setup and configuration
- **database-redis.md** - Redis caching and sessions

### DevOps & Deployment
- **tools-docker.md** - Docker containerization
- **tools-kubernetes.md** - Kubernetes orchestration
- **tools-cicd.md** - CI/CD pipeline setup

## Integration

Technology stack modules ensure:
- Consistent development environment setup
- Production-ready configurations
- Cost-optimized deployment strategies
- Platform-specific best practices
- Scalability and performance optimization
- Security and compliance standards

## Related Modules
- [Feature Patterns](../feature-patterns/README.md) - Common feature templates
- [Cross-Platform](../cross-platform/README.md) - Cross-platform parity modules
- [Testing](../testing/README.md) - Testing and mock data modules

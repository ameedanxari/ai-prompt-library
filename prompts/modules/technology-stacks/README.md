# Technology Stacks Module

## Purpose

Technology-specific modules that adapt features and architecture to different technology stacks and deployment platforms. These modules provide production-ready configurations, cost-optimized deployment strategies, and platform-specific best practices for building scalable applications across web, mobile, and backend technologies.

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

### Example 3: Mobile-First Application
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

### Example 4: Enterprise SaaS Platform
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
- **web-nextjs.md** - Next.js full-stack setup
- **web-vue.md** - Vue.js application setup

### Backend Development
- **backend-nodejs.md** - Node.js and Express setup
- **python-ecosystem.md** - Python (Django, FastAPI, Flask) comprehensive setup
- **backend-java.md** - Java and Spring Boot setup

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
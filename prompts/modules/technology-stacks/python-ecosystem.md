# Python Ecosystem Technology Stack Template

## Purpose

This template provides comprehensive patterns for implementing Python-based applications across web frameworks, APIs, data science, and enterprise systems. It covers Django, FastAPI, Flask, data processing pipelines, and modern Python development practices with production-ready defaults.

## Context

Python's versatility makes it ideal for web applications, APIs, data science, machine learning, automation, and enterprise systems. This template addresses the complexity of choosing the right Python framework and tools while ensuring scalability, security, and maintainability across different Python application types.

## Examples

### Example 1: Django Web Application
```python
# Django project with REST API
# settings.py configured for production
# User model with authentication
# API endpoints with proper serialization
# Database migrations and admin interface
```

### Example 2: FastAPI Microservice
```python
# High-performance async API
# Automatic OpenAPI documentation
# JWT authentication middleware
# Database integration with SQLAlchemy
# Docker containerization ready
```

### Example 3: Data Science Platform
```python
# Streamlit dashboard application
# Interactive data visualization
# Machine learning model deployment
# Real-time analytics processing
# User authentication and session management
```

## Instructions

### Framework Selection Matrix

Choose the appropriate Python framework based on your requirements:

| Use Case | Framework | Best For | Complexity |
|----------|-----------|----------|------------|
| **Full-stack Web App** | Django | Content management, admin interfaces, rapid development | Medium |
| **High-performance API** | FastAPI | Modern APIs, async operations, automatic documentation | Low-Medium |
| **Lightweight Web App** | Flask | Microservices, simple APIs, custom architectures | Low |
| **Data Science Platform** | Streamlit/Dash | Data visualization, ML model deployment | Low |
| **Enterprise Integration** | Django + DRF | Large-scale systems, complex business logic | High |

### Django Implementation

```python
# settings/base.py
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# Security Configuration
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Application Definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'celery',
    'redis',
]

LOCAL_APPS = [
    'apps.users',
    'apps.core',
    'apps.api',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require' if not DEBUG else 'prefer',
        },
    }
}

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
```

### FastAPI Implementation

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from .auth import verify_token
from .routers import users, items, health
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="Python API",
    description="Production-ready FastAPI application",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    token = credentials.credentials
    user = await verify_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

# Routes
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(
    users.router, 
    prefix="/api/v1/users", 
    tags=["users"],
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    items.router, 
    prefix="/api/v1/items", 
    tags=["items"],
    dependencies=[Depends(get_current_user)]
)

# Database Models
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Pydantic Schemas
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
```

### Flask Implementation

```python
# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # Extensions
    db = SQLAlchemy(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app)
    
    # Rate Limiting
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )
    
    # Models
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=False)
        email = db.Column(db.String(120), unique=True, nullable=False)
        password_hash = db.Column(db.String(255), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        is_active = db.Column(db.Boolean, default=True)
        
        def set_password(self, password):
            self.password_hash = generate_password_hash(password)
            
        def check_password(self, password):
            return check_password_hash(self.password_hash, password)
            
        def to_dict(self):
            return {
                'id': self.id,
                'username': self.username,
                'email': self.email,
                'created_at': self.created_at.isoformat(),
                'is_active': self.is_active
            }
    
    # Routes
    @app.route('/api/auth/register', methods=['POST'])
    @limiter.limit("5 per minute")
    def register():
        data = request.get_json()
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
            
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
    
    @app.route('/api/auth/login', methods=['POST'])
    @limiter.limit("10 per minute")
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'access_token': access_token,
                'user': user.to_dict()
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
    
    @app.route('/api/profile', methods=['GET'])
    @jwt_required()
    def profile():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        return jsonify(user.to_dict())
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
```

### Data Science Implementation

```python
# streamlit_app.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
from datetime import datetime
import os

# Page Configuration
st.set_page_config(
    page_title="Data Science Platform",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Authentication
def check_authentication():
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    
    if not st.session_state.authenticated:
        st.title("🔐 Login Required")
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        
        if st.button("Login"):
            # In production, use proper authentication
            if username == "admin" and password == "password":
                st.session_state.authenticated = True
                st.rerun()
            else:
                st.error("Invalid credentials")
        return False
    return True

# Main Application
def main():
    if not check_authentication():
        return
    
    st.title("📊 Data Science Platform")
    
    # Sidebar
    st.sidebar.title("Navigation")
    page = st.sidebar.selectbox(
        "Choose a page",
        ["Data Upload", "Data Analysis", "Model Training", "Predictions"]
    )
    
    if page == "Data Upload":
        data_upload_page()
    elif page == "Data Analysis":
        data_analysis_page()
    elif page == "Model Training":
        model_training_page()
    elif page == "Predictions":
        predictions_page()

def data_upload_page():
    st.header("📁 Data Upload")
    
    uploaded_file = st.file_uploader(
        "Choose a CSV file",
        type="csv",
        help="Upload your dataset for analysis"
    )
    
    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
        st.session_state.df = df
        
        st.success(f"Dataset uploaded successfully! Shape: {df.shape}")
        
        # Data Preview
        st.subheader("Data Preview")
        st.dataframe(df.head())
        
        # Data Info
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Dataset Info")
            st.write(f"Rows: {df.shape[0]}")
            st.write(f"Columns: {df.shape[1]}")
            st.write(f"Memory usage: {df.memory_usage().sum() / 1024**2:.2f} MB")
        
        with col2:
            st.subheader("Data Types")
            st.write(df.dtypes)

def data_analysis_page():
    st.header("📈 Data Analysis")
    
    if 'df' not in st.session_state:
        st.warning("Please upload data first!")
        return
    
    df = st.session_state.df
    
    # Statistical Summary
    st.subheader("Statistical Summary")
    st.dataframe(df.describe())
    
    # Visualization
    st.subheader("Data Visualization")
    
    numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(numeric_columns) >= 2:
        col1, col2 = st.columns(2)
        
        with col1:
            x_axis = st.selectbox("X-axis", numeric_columns)
        with col2:
            y_axis = st.selectbox("Y-axis", numeric_columns)
        
        # Scatter Plot
        fig = px.scatter(df, x=x_axis, y=y_axis, title=f"{x_axis} vs {y_axis}")
        st.plotly_chart(fig, use_container_width=True)
        
        # Correlation Matrix
        st.subheader("Correlation Matrix")
        corr_matrix = df[numeric_columns].corr()
        fig = px.imshow(corr_matrix, text_auto=True, aspect="auto")
        st.plotly_chart(fig, use_container_width=True)

def model_training_page():
    st.header("🤖 Model Training")
    
    if 'df' not in st.session_state:
        st.warning("Please upload data first!")
        return
    
    df = st.session_state.df
    
    # Feature Selection
    st.subheader("Feature Selection")
    
    numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(numeric_columns) < 2:
        st.error("Need at least 2 numeric columns for training!")
        return
    
    target_column = st.selectbox("Select target column", numeric_columns)
    feature_columns = st.multiselect(
        "Select feature columns",
        [col for col in numeric_columns if col != target_column],
        default=[col for col in numeric_columns if col != target_column][:5]
    )
    
    if not feature_columns:
        st.warning("Please select at least one feature column!")
        return
    
    # Model Training
    if st.button("Train Model"):
        with st.spinner("Training model..."):
            X = df[feature_columns]
            y = df[target_column]
            
            # Handle missing values
            X = X.fillna(X.mean())
            y = y.fillna(y.mean())
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Predictions
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Save model
            model_path = f"model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.joblib"
            joblib.dump(model, model_path)
            
            st.session_state.model = model
            st.session_state.feature_columns = feature_columns
            st.session_state.model_path = model_path
            
            st.success(f"Model trained successfully! Accuracy: {accuracy:.2f}")
            
            # Feature Importance
            importance_df = pd.DataFrame({
                'feature': feature_columns,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            fig = px.bar(importance_df, x='importance', y='feature', 
                        title="Feature Importance")
            st.plotly_chart(fig, use_container_width=True)

def predictions_page():
    st.header("🔮 Predictions")
    
    if 'model' not in st.session_state:
        st.warning("Please train a model first!")
        return
    
    model = st.session_state.model
    feature_columns = st.session_state.feature_columns
    
    st.subheader("Make Predictions")
    
    # Input features
    input_data = {}
    cols = st.columns(len(feature_columns))
    
    for i, feature in enumerate(feature_columns):
        with cols[i % len(cols)]:
            input_data[feature] = st.number_input(f"{feature}", value=0.0)
    
    if st.button("Predict"):
        input_df = pd.DataFrame([input_data])
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0].max()
        
        st.success(f"Prediction: {prediction}")
        st.info(f"Confidence: {probability:.2f}")

if __name__ == "__main__":
    main()
```

### Development Environment Setup

```python
# requirements/base.txt
# Core Dependencies
python-decouple==3.8
psycopg2-binary==2.9.7
redis==4.6.0
celery==5.3.1

# Web Frameworks
django==4.2.5
djangorestframework==3.14.0
fastapi==0.103.1
uvicorn[standard]==0.23.2
flask==2.3.3

# Database
sqlalchemy==2.0.20
alembic==1.12.0
django-extensions==3.2.3

# Authentication & Security
django-cors-headers==4.2.0
pyjwt==2.8.0
flask-jwt-extended==4.5.2
passlib[bcrypt]==1.7.4

# API Documentation
drf-spectacular==0.26.4

# Data Science
pandas==2.1.0
numpy==1.25.2
scikit-learn==1.3.0
plotly==5.16.1
streamlit==1.26.0

# Testing
pytest==7.4.2
pytest-django==4.5.2
pytest-asyncio==0.21.1
factory-boy==3.3.0
faker==19.6.1

# Development
black==23.7.0
flake8==6.0.0
mypy==1.5.1
pre-commit==3.4.0

# requirements/development.txt
-r base.txt
django-debug-toolbar==4.2.0
ipython==8.15.0
jupyter==1.0.0

# requirements/production.txt
-r base.txt
gunicorn==21.2.0
whitenoise==6.5.0
sentry-sdk==1.32.0
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements/production.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./:/app
    command: gunicorn --bind 0.0.0.0:8000 config.wsgi:application

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery:
    build: .
    command: celery -A config worker -l info
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./:/app

volumes:
  postgres_data:
```

### Testing Configuration

```python
# conftest.py
import pytest
from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from fastapi.testclient import TestClient
import factory
from faker import Faker

fake = Faker()
User = get_user_model()

# Django Test Setup
@pytest.fixture
def django_client():
    return Client()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

# FastAPI Test Setup
from main import app

@pytest.fixture
def fastapi_client():
    return TestClient(app)

# Factory Classes
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')

# Test Examples
def test_user_creation(user):
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    assert user.check_password('testpass123')

def test_api_authentication(authenticated_client):
    response = authenticated_client.get('/api/profile/')
    assert response.status_code == 200

def test_fastapi_health_check(fastapi_client):
    response = fastapi_client.get("/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Deployment Configuration

```python
# config/settings/production.py
from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

# Security
DEBUG = False
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Database
DATABASES['default']['CONN_MAX_AGE'] = 60

# Static Files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}

# Sentry
sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[
        DjangoIntegration(),
        CeleryIntegration(),
    ],
    traces_sample_rate=0.1,
    send_default_pii=True
)
```

## Expected Output

This template will produce:

- **Django Applications**: Full-stack web applications with admin interface, ORM, and REST APIs
- **FastAPI Services**: High-performance async APIs with automatic documentation
- **Flask Applications**: Lightweight web services and microservices
- **Data Science Platforms**: Interactive dashboards and ML model deployment
- **Production Configuration**: Docker, database, caching, and deployment setup
- **Testing Framework**: Comprehensive test suites with fixtures and factories
- **Security Implementation**: Authentication, authorization, and security best practices
- **Performance Optimization**: Caching, database optimization, and async processing

## Integration Points

- Connects with deployment modules for containerization and CI/CD
- Integrates with testing modules for comprehensive test coverage
- Works with security modules for authentication and authorization
- Supports performance modules for optimization and monitoring
- Compatible with data processing modules for ETL and analytics

## Security Considerations

- Environment variable configuration for sensitive data
- SQL injection prevention through ORM usage
- CSRF protection and secure headers
- Rate limiting and authentication middleware
- Input validation and sanitization
- Secure password hashing and JWT tokens

## Performance Features

- Database connection pooling and query optimization
- Redis caching for session and data storage
- Async processing with Celery for background tasks
- Static file optimization and CDN integration
- Database indexing and query optimization
- Memory usage monitoring and optimization

## Accessibility & Internationalization

- Django's built-in i18n framework for multi-language support
- Accessible form rendering and validation
- Screen reader compatible admin interface
- RTL language support and timezone handling
- Accessible data visualization in Streamlit applications
- WCAG compliant HTML generation

This template provides a comprehensive foundation for Python-based applications across web development, APIs, data science, and enterprise systems with production-ready defaults and modern development practices.
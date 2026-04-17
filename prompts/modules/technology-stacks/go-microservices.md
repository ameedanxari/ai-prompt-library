# Go Microservices Technology Stack Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing Go-based microservices with cloud-native architectures, including REST APIs, gRPC services, message queues, and distributed systems. It covers modern Go frameworks, containerization, observability, and production-ready deployment strategies for scalable microservice ecosystems.

## Context

Go's performance, concurrency model, and small binary size make it ideal for microservices, cloud-native applications, and distributed systems. This template addresses the complexity of building production-ready Go microservices with proper error handling, observability, testing, and deployment while leveraging Go's strengths in concurrent programming and system-level development.

## Examples

### Example 1: REST API Microservice
```go
// High-performance REST API with Gin framework
// JWT authentication and middleware
// Database integration with GORM
// Structured logging and metrics
func main() {
    r := gin.New()
    r.Use(middleware.Logger(), middleware.Auth())
    r.GET("/api/v1/users", handlers.GetUsers)
    r.Run(":8080")
}
```

### Example 2: gRPC Service
```go
// High-performance gRPC microservice
// Protocol buffer definitions
// Streaming and unary RPC methods
// Service discovery and load balancing
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
```

### Example 3: Event-Driven Architecture
```go
// Message queue integration with NATS/RabbitMQ
// Event sourcing and CQRS patterns
// Distributed tracing and monitoring
func (h *OrderHandler) HandleOrderCreated(ctx context.Context, event OrderCreatedEvent) error {
    span, ctx := opentracing.StartSpanFromContext(ctx, "handle_order_created")
    defer span.Finish()
    
    // Process order asynchronously
    return h.orderService.ProcessOrder(ctx, event.OrderID)
}
```

## Instructions

### Framework Selection Matrix

Choose the appropriate Go framework based on your requirements:

| Use Case | Framework | Best For | Performance | Learning Curve |
|----------|-----------|----------|-------------|----------------|
| **REST API** | Gin | High-performance HTTP services | Very High | Low |
| **Web Framework** | Echo | Full-featured web applications | High | Low |
| **Minimalist** | Gorilla Mux | Simple routing, standard library | High | Very Low |
| **gRPC Services** | gRPC-Go | High-performance RPC services | Very High | Medium |
| **GraphQL** | gqlgen | GraphQL APIs with type safety | High | Medium |
| **Microframework** | Fiber | Express.js-like experience | Very High | Low |

### REST API Implementation

```go
// main.go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "go.uber.org/zap"
    
    "myapp/internal/config"
    "myapp/internal/database"
    "myapp/internal/handlers"
    "myapp/internal/middleware"
    "myapp/internal/repository"
    "myapp/internal/service"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize configuration
    cfg := config.Load()

    // Initialize logger
    logger, err := zap.NewProduction()
    if err != nil {
        log.Fatal("Failed to initialize logger:", err)
    }
    defer logger.Sync()

    // Initialize database
    db, err := database.Connect(cfg.DatabaseURL)
    if err != nil {
        logger.Fatal("Failed to connect to database", zap.Error(err))
    }
    defer db.Close()

    // Run migrations
    if err := database.Migrate(db); err != nil {
        logger.Fatal("Failed to run migrations", zap.Error(err))
    }

    // Initialize repositories
    userRepo := repository.NewUserRepository(db)
    orderRepo := repository.NewOrderRepository(db)

    // Initialize services
    userService := service.NewUserService(userRepo, logger)
    orderService := service.NewOrderService(orderRepo, userService, logger)

    // Initialize handlers
    userHandler := handlers.NewUserHandler(userService, logger)
    orderHandler := handlers.NewOrderHandler(orderService, logger)

    // Setup router
    router := setupRouter(cfg, userHandler, orderHandler, logger)

    // Setup server
    srv := &http.Server{
        Addr:         ":" + cfg.Port,
        Handler:      router,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Start server in goroutine
    go func() {
        logger.Info("Starting server", zap.String("port", cfg.Port))
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logger.Fatal("Failed to start server", zap.Error(err))
        }
    }()

    // Wait for interrupt signal to gracefully shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    logger.Info("Shutting down server...")

    // Graceful shutdown with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        logger.Fatal("Server forced to shutdown", zap.Error(err))
    }

    logger.Info("Server exited")
}

func setupRouter(cfg *config.Config, userHandler *handlers.UserHandler, orderHandler *handlers.OrderHandler, logger *zap.Logger) *gin.Engine {
    // Set Gin mode
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    router := gin.New()

    // Middleware
    router.Use(middleware.Logger(logger))
    router.Use(middleware.Recovery(logger))
    router.Use(middleware.CORS())
    router.Use(middleware.RequestID())
    router.Use(middleware.RateLimit(cfg.RateLimit))

    // Health check
    router.GET("/health", handlers.HealthCheck)
    router.GET("/metrics", handlers.Metrics)

    // API routes
    v1 := router.Group("/api/v1")
    {
        // Authentication
        auth := v1.Group("/auth")
        {
            auth.POST("/login", userHandler.Login)
            auth.POST("/register", userHandler.Register)
            auth.POST("/refresh", userHandler.RefreshToken)
        }

        // Protected routes
        protected := v1.Group("/")
        protected.Use(middleware.AuthRequired())
        {
            // Users
            users := protected.Group("/users")
            {
                users.GET("", userHandler.GetUsers)
                users.GET("/:id", userHandler.GetUser)
                users.PUT("/:id", userHandler.UpdateUser)
                users.DELETE("/:id", userHandler.DeleteUser)
            }

            // Orders
            orders := protected.Group("/orders")
            {
                orders.GET("", orderHandler.GetOrders)
                orders.POST("", orderHandler.CreateOrder)
                orders.GET("/:id", orderHandler.GetOrder)
                orders.PUT("/:id", orderHandler.UpdateOrder)
                orders.DELETE("/:id", orderHandler.DeleteOrder)
            }
        }
    }

    return router
}

// internal/config/config.go
package config

import (
    "os"
    "strconv"
)

type Config struct {
    Environment   string
    Port          string
    DatabaseURL   string
    JWTSecret     string
    RedisURL      string
    RateLimit     int
    LogLevel      string
}

func Load() *Config {
    return &Config{
        Environment: getEnv("ENVIRONMENT", "development"),
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost/myapp?sslmode=disable"),
        JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
        RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
        RateLimit:   getEnvAsInt("RATE_LIMIT", 100),
        LogLevel:    getEnv("LOG_LEVEL", "info"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
    if value := os.Getenv(key); value != "" {
        if intValue, err := strconv.Atoi(value); err == nil {
            return intValue
        }
    }
    return defaultValue
}

// internal/models/user.go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        uint           `json:"id" gorm:"primarykey"`
    Email     string         `json:"email" gorm:"uniqueIndex;not null"`
    Username  string         `json:"username" gorm:"uniqueIndex;not null"`
    Password  string         `json:"-" gorm:"not null"`
    FirstName string         `json:"first_name"`
    LastName  string         `json:"last_name"`
    IsActive  bool           `json:"is_active" gorm:"default:true"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type UserCreateRequest struct {
    Email     string `json:"email" binding:"required,email"`
    Username  string `json:"username" binding:"required,min=3,max=50"`
    Password  string `json:"password" binding:"required,min=8"`
    FirstName string `json:"first_name" binding:"required"`
    LastName  string `json:"last_name" binding:"required"`
}

type UserUpdateRequest struct {
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
    IsActive  *bool  `json:"is_active"`
}

type UserResponse struct {
    ID        uint      `json:"id"`
    Email     string    `json:"email"`
    Username  string    `json:"username"`
    FirstName string    `json:"first_name"`
    LastName  string    `json:"last_name"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) ToResponse() *UserResponse {
    return &UserResponse{
        ID:        u.ID,
        Email:     u.Email,
        Username:  u.Username,
        FirstName: u.FirstName,
        LastName:  u.LastName,
        IsActive:  u.IsActive,
        CreatedAt: u.CreatedAt,
        UpdatedAt: u.UpdatedAt,
    }
}
```

### gRPC Service Implementation

```go
// proto/user.proto
syntax = "proto3";

package user;

option go_package = "myapp/proto/user";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (Empty);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc StreamUsers(StreamUsersRequest) returns (stream User);
}

message User {
  uint32 id = 1;
  string email = 2;
  string username = 3;
  string first_name = 4;
  string last_name = 5;
  bool is_active = 6;
  int64 created_at = 7;
  int64 updated_at = 8;
}

message GetUserRequest {
  uint32 id = 1;
}

message CreateUserRequest {
  string email = 1;
  string username = 2;
  string password = 3;
  string first_name = 4;
  string last_name = 5;
}

message UpdateUserRequest {
  uint32 id = 1;
  string first_name = 2;
  string last_name = 3;
  bool is_active = 4;
}

message DeleteUserRequest {
  uint32 id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
  string search = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
  int32 page = 3;
  int32 page_size = 4;
}

message StreamUsersRequest {
  string filter = 1;
}

message Empty {}

// internal/grpc/server.go
package grpc

import (
    "context"
    "net"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
    "google.golang.org/grpc/reflection"
    "google.golang.org/grpc/keepalive"
    "go.uber.org/zap"

    pb "myapp/proto/user"
    "myapp/internal/service"
)

type UserServiceServer struct {
    pb.UnimplementedUserServiceServer
    userService *service.UserService
    logger      *zap.Logger
}

func NewUserServiceServer(userService *service.UserService, logger *zap.Logger) *UserServiceServer {
    return &UserServiceServer{
        userService: userService,
        logger:      logger,
    }
}

func (s *UserServiceServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.userService.GetByID(ctx, uint(req.Id))
    if err != nil {
        s.logger.Error("Failed to get user", zap.Error(err), zap.Uint32("user_id", req.Id))
        return nil, status.Errorf(codes.NotFound, "user not found: %v", err)
    }

    return &pb.User{
        Id:        uint32(user.ID),
        Email:     user.Email,
        Username:  user.Username,
        FirstName: user.FirstName,
        LastName:  user.LastName,
        IsActive:  user.IsActive,
        CreatedAt: user.CreatedAt.Unix(),
        UpdatedAt: user.UpdatedAt.Unix(),
    }, nil
}

func (s *UserServiceServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.User, error) {
    createReq := &models.UserCreateRequest{
        Email:     req.Email,
        Username:  req.Username,
        Password:  req.Password,
        FirstName: req.FirstName,
        LastName:  req.LastName,
    }

    user, err := s.userService.Create(ctx, createReq)
    if err != nil {
        s.logger.Error("Failed to create user", zap.Error(err))
        return nil, status.Errorf(codes.Internal, "failed to create user: %v", err)
    }

    return &pb.User{
        Id:        uint32(user.ID),
        Email:     user.Email,
        Username:  user.Username,
        FirstName: user.FirstName,
        LastName:  user.LastName,
        IsActive:  user.IsActive,
        CreatedAt: user.CreatedAt.Unix(),
        UpdatedAt: user.UpdatedAt.Unix(),
    }, nil
}

func (s *UserServiceServer) StreamUsers(req *pb.StreamUsersRequest, stream pb.UserService_StreamUsersServer) error {
    users, err := s.userService.GetAll(stream.Context())
    if err != nil {
        return status.Errorf(codes.Internal, "failed to get users: %v", err)
    }

    for _, user := range users {
        pbUser := &pb.User{
            Id:        uint32(user.ID),
            Email:     user.Email,
            Username:  user.Username,
            FirstName: user.FirstName,
            LastName:  user.LastName,
            IsActive:  user.IsActive,
            CreatedAt: user.CreatedAt.Unix(),
            UpdatedAt: user.UpdatedAt.Unix(),
        }

        if err := stream.Send(pbUser); err != nil {
            return status.Errorf(codes.Internal, "failed to send user: %v", err)
        }

        // Simulate streaming delay
        time.Sleep(100 * time.Millisecond)
    }

    return nil
}

func StartGRPCServer(userService *service.UserService, logger *zap.Logger, port string) error {
    lis, err := net.Listen("tcp", ":"+port)
    if err != nil {
        return err
    }

    // gRPC server options
    opts := []grpc.ServerOption{
        grpc.KeepaliveParams(keepalive.ServerParameters{
            MaxConnectionIdle: 15 * time.Second,
            MaxConnectionAge:  30 * time.Second,
            Time:              5 * time.Second,
            Timeout:           1 * time.Second,
        }),
        grpc.KeepaliveEnforcementPolicy(keepalive.EnforcementPolicy{
            MinTime:             5 * time.Second,
            PermitWithoutStream: true,
        }),
    }

    server := grpc.NewServer(opts...)
    
    // Register services
    userServiceServer := NewUserServiceServer(userService, logger)
    pb.RegisterUserServiceServer(server, userServiceServer)

    // Enable reflection for development
    reflection.Register(server)

    logger.Info("Starting gRPC server", zap.String("port", port))
    return server.Serve(lis)
}
```

### Message Queue Integration

```go
// internal/messaging/nats.go
package messaging

import (
    "context"
    "encoding/json"
    "time"

    "github.com/nats-io/nats.go"
    "go.uber.org/zap"
)

type NATSClient struct {
    conn   *nats.Conn
    logger *zap.Logger
}

func NewNATSClient(url string, logger *zap.Logger) (*NATSClient, error) {
    conn, err := nats.Connect(url,
        nats.ReconnectWait(time.Second*2),
        nats.MaxReconnects(10),
        nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
            logger.Error("NATS disconnected", zap.Error(err))
        }),
        nats.ReconnectHandler(func(nc *nats.Conn) {
            logger.Info("NATS reconnected", zap.String("url", nc.ConnectedUrl()))
        }),
    )
    if err != nil {
        return nil, err
    }

    return &NATSClient{
        conn:   conn,
        logger: logger,
    }, nil
}

func (n *NATSClient) Publish(subject string, data interface{}) error {
    payload, err := json.Marshal(data)
    if err != nil {
        return err
    }

    return n.conn.Publish(subject, payload)
}

func (n *NATSClient) Subscribe(subject string, handler func([]byte) error) (*nats.Subscription, error) {
    return n.conn.Subscribe(subject, func(msg *nats.Msg) {
        if err := handler(msg.Data); err != nil {
            n.logger.Error("Message handler error",
                zap.String("subject", subject),
                zap.Error(err),
            )
        }
    })
}

func (n *NATSClient) QueueSubscribe(subject, queue string, handler func([]byte) error) (*nats.Subscription, error) {
    return n.conn.QueueSubscribe(subject, queue, func(msg *nats.Msg) {
        if err := handler(msg.Data); err != nil {
            n.logger.Error("Queue message handler error",
                zap.String("subject", subject),
                zap.String("queue", queue),
                zap.Error(err),
            )
        }
    })
}

func (n *NATSClient) Close() {
    n.conn.Close()
}

// Event definitions
type OrderCreatedEvent struct {
    OrderID   uint      `json:"order_id"`
    UserID    uint      `json:"user_id"`
    Amount    float64   `json:"amount"`
    CreatedAt time.Time `json:"created_at"`
}

type UserRegisteredEvent struct {
    UserID    uint      `json:"user_id"`
    Email     string    `json:"email"`
    Username  string    `json:"username"`
    CreatedAt time.Time `json:"created_at"`
}

// Event handlers
type EventHandler struct {
    userService  *service.UserService
    orderService *service.OrderService
    logger       *zap.Logger
}

func NewEventHandler(userService *service.UserService, orderService *service.OrderService, logger *zap.Logger) *EventHandler {
    return &EventHandler{
        userService:  userService,
        orderService: orderService,
        logger:       logger,
    }
}

func (h *EventHandler) HandleOrderCreated(data []byte) error {
    var event OrderCreatedEvent
    if err := json.Unmarshal(data, &event); err != nil {
        return err
    }

    h.logger.Info("Processing order created event",
        zap.Uint("order_id", event.OrderID),
        zap.Uint("user_id", event.UserID),
    )

    // Process order (send email, update inventory, etc.)
    return h.orderService.ProcessOrder(context.Background(), event.OrderID)
}

func (h *EventHandler) HandleUserRegistered(data []byte) error {
    var event UserRegisteredEvent
    if err := json.Unmarshal(data, &event); err != nil {
        return err
    }

    h.logger.Info("Processing user registered event",
        zap.Uint("user_id", event.UserID),
        zap.String("email", event.Email),
    )

    // Send welcome email, create user profile, etc.
    return h.userService.SendWelcomeEmail(context.Background(), event.UserID)
}
```

### Testing Implementation

```go
// internal/handlers/user_test.go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "go.uber.org/zap"

    "myapp/internal/models"
    "myapp/internal/service/mocks"
)

func TestUserHandler_CreateUser(t *testing.T) {
    gin.SetMode(gin.TestMode)

    tests := []struct {
        name           string
        requestBody    models.UserCreateRequest
        mockSetup      func(*mocks.UserService)
        expectedStatus int
        expectedError  string
    }{
        {
            name: "successful user creation",
            requestBody: models.UserCreateRequest{
                Email:     "test@example.com",
                Username:  "testuser",
                Password:  "password123",
                FirstName: "Test",
                LastName:  "User",
            },
            mockSetup: func(m *mocks.UserService) {
                user := &models.User{
                    ID:        1,
                    Email:     "test@example.com",
                    Username:  "testuser",
                    FirstName: "Test",
                    LastName:  "User",
                    IsActive:  true,
                }
                m.On("Create", mock.Anything, mock.AnythingOfType("*models.UserCreateRequest")).Return(user, nil)
            },
            expectedStatus: http.StatusCreated,
        },
        {
            name: "invalid email",
            requestBody: models.UserCreateRequest{
                Email:     "invalid-email",
                Username:  "testuser",
                Password:  "password123",
                FirstName: "Test",
                LastName:  "User",
            },
            mockSetup:      func(m *mocks.UserService) {},
            expectedStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Setup
            mockUserService := new(mocks.UserService)
            tt.mockSetup(mockUserService)

            logger := zap.NewNop()
            handler := NewUserHandler(mockUserService, logger)

            router := gin.New()
            router.POST("/users", handler.CreateUser)

            // Prepare request
            body, _ := json.Marshal(tt.requestBody)
            req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewBuffer(body))
            req.Header.Set("Content-Type", "application/json")
            w := httptest.NewRecorder()

            // Execute
            router.ServeHTTP(w, req)

            // Assert
            assert.Equal(t, tt.expectedStatus, w.Code)
            mockUserService.AssertExpectations(t)
        })
    }
}

// Benchmark tests
func BenchmarkUserHandler_GetUsers(b *testing.B) {
    gin.SetMode(gin.TestMode)
    
    mockUserService := new(mocks.UserService)
    users := make([]*models.User, 100)
    for i := 0; i < 100; i++ {
        users[i] = &models.User{
            ID:       uint(i + 1),
            Email:    fmt.Sprintf("user%d@example.com", i+1),
            Username: fmt.Sprintf("user%d", i+1),
        }
    }
    mockUserService.On("GetAll", mock.Anything).Return(users, nil)

    logger := zap.NewNop()
    handler := NewUserHandler(mockUserService, logger)

    router := gin.New()
    router.GET("/users", handler.GetUsers)

    req := httptest.NewRequest(http.MethodGet, "/users", nil)

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        w := httptest.NewRecorder()
        router.ServeHTTP(w, req)
    }
}

// Integration tests
func TestUserIntegration(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer db.Close()

    // Setup dependencies
    userRepo := repository.NewUserRepository(db)
    logger := zap.NewNop()
    userService := service.NewUserService(userRepo, logger)
    userHandler := NewUserHandler(userService, logger)

    router := gin.New()
    router.POST("/users", userHandler.CreateUser)
    router.GET("/users/:id", userHandler.GetUser)

    t.Run("create and retrieve user", func(t *testing.T) {
        // Create user
        createReq := models.UserCreateRequest{
            Email:     "integration@example.com",
            Username:  "integrationuser",
            Password:  "password123",
            FirstName: "Integration",
            LastName:  "Test",
        }

        body, _ := json.Marshal(createReq)
        req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewBuffer(body))
        req.Header.Set("Content-Type", "application/json")
        w := httptest.NewRecorder()

        router.ServeHTTP(w, req)
        assert.Equal(t, http.StatusCreated, w.Code)

        var createdUser models.UserResponse
        err := json.Unmarshal(w.Body.Bytes(), &createdUser)
        assert.NoError(t, err)
        assert.Equal(t, createReq.Email, createdUser.Email)

        // Retrieve user
        req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/users/%d", createdUser.ID), nil)
        w = httptest.NewRecorder()

        router.ServeHTTP(w, req)
        assert.Equal(t, http.StatusOK, w.Code)

        var retrievedUser models.UserResponse
        err = json.Unmarshal(w.Body.Bytes(), &retrievedUser)
        assert.NoError(t, err)
        assert.Equal(t, createdUser.ID, retrievedUser.ID)
        assert.Equal(t, createdUser.Email, retrievedUser.Email)
    })
}
```

### Docker and Deployment Configuration

```dockerfile
# Dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy configuration files
COPY --from=builder /app/configs ./configs

# Create non-root user
RUN adduser -D -s /bin/sh appuser
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./main"]

# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ENVIRONMENT=development
      - DATABASE_URL=postgres://postgres:password@db:5432/myapp?sslmode=disable
      - REDIS_URL=redis://redis:6379
      - NATS_URL=nats://nats:4222
    depends_on:
      - db
      - redis
      - nats
    volumes:
      - ./configs:/root/configs
    restart: unless-stopped

  grpc:
    build: .
    command: ["./main", "-mode=grpc"]
    ports:
      - "9090:9090"
    environment:
      - ENVIRONMENT=development
      - DATABASE_URL=postgres://postgres:password@db:5432/myapp?sslmode=disable
      - GRPC_PORT=9090
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nats:
    image: nats:2.10-alpine
    ports:
      - "4222:4222"
      - "8222:8222"
    command: ["--http_port", "8222"]
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9091:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  grafana_data:
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-microservice
  labels:
    app: go-microservice
spec:
  replicas: 3
  selector:
    matchLabels:
      app: go-microservice
  template:
    metadata:
      labels:
        app: go-microservice
    spec:
      containers:
      - name: go-microservice
        image: go-microservice:latest
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: grpc
        env:
        - name: ENVIRONMENT
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: go-microservice-http
spec:
  selector:
    app: go-microservice
  ports:
  - port: 80
    targetPort: 8080
    name: http
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: go-microservice-grpc
spec:
  selector:
    app: go-microservice
  ports:
  - port: 9090
    targetPort: 9090
    name: grpc
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: go-microservice-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: go-microservice-http
            port:
              number: 80
```

### Monitoring and Observability

```go
// internal/middleware/metrics.go
package middleware

import (
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    httpRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    httpRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "Duration of HTTP requests in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )

    activeConnections = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "http_active_connections",
            Help: "Number of active HTTP connections",
        },
    )
)

func PrometheusMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        activeConnections.Inc()

        c.Next()

        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Writer.Status())

        httpRequestsTotal.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            status,
        ).Inc()

        httpRequestDuration.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
        ).Observe(duration)

        activeConnections.Dec()
    }
}

// internal/tracing/jaeger.go
package tracing

import (
    "io"

    "github.com/opentracing/opentracing-go"
    "github.com/uber/jaeger-client-go"
    "github.com/uber/jaeger-client-go/config"
)

func InitJaeger(serviceName string) (opentracing.Tracer, io.Closer, error) {
    cfg := config.Configuration{
        ServiceName: serviceName,
        Sampler: &config.SamplerConfig{
            Type:  jaeger.SamplerTypeConst,
            Param: 1,
        },
        Reporter: &config.ReporterConfig{
            LogSpans: true,
        },
    }

    tracer, closer, err := cfg.NewTracer()
    if err != nil {
        return nil, nil, err
    }

    opentracing.SetGlobalTracer(tracer)
    return tracer, closer, nil
}
```

## Expected Output

This template will produce:

- **High-Performance REST APIs**: Gin-based HTTP services with middleware and authentication
- **gRPC Microservices**: Protocol buffer-based RPC services with streaming support
- **Event-Driven Architecture**: NATS/RabbitMQ integration with message handling
- **Database Integration**: GORM-based data access with migrations and transactions
- **Container Deployment**: Docker and Kubernetes configurations for cloud deployment
- **Monitoring & Observability**: Prometheus metrics, Jaeger tracing, and structured logging
- **Testing Framework**: Unit, integration, and benchmark tests with mocks
- **CI/CD Integration**: GitHub Actions workflows for automated testing and deployment

## Integration Points

- Connects with modern deployment patterns for blue-green and canary deployments
- Integrates with containerization modules for Docker and Kubernetes orchestration
- Works with monitoring modules for observability and alerting
- Supports message queue integration for event-driven architectures
- Compatible with cloud deployment modules for AWS, GCP, and Azure platforms

## Security Considerations

- JWT-based authentication with refresh token support
- Input validation and sanitization with Gin binding
- Rate limiting and request throttling middleware
- Secure database connections with connection pooling
- Container security with non-root user and minimal base images

## Performance Features

- Goroutine-based concurrency for high throughput
- Connection pooling for database and Redis connections
- Efficient JSON serialization and deserialization
- HTTP/2 support for gRPC services
- Memory-efficient request handling with minimal allocations

## Accessibility & Internationalization

- Structured logging with contextual information
- Error messages with internationalization support
- API documentation with OpenAPI/Swagger integration
- Health check endpoints for monitoring and load balancing
- Graceful shutdown handling for zero-downtime deployments

This template provides a comprehensive foundation for Go-based microservices with cloud-native patterns, high performance, and production-ready deployment strategies.

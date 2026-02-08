# Rust Systems Programming Template

## Purpose

This template provides comprehensive patterns for building high-performance systems applications using Rust, including memory-safe systems programming, concurrent applications, WebAssembly modules, and performance-critical services. It covers enterprise-scale Rust development with advanced memory management, zero-cost abstractions, and fearless concurrency.

## Context

Rust is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety. This template addresses modern Rust development including async programming, WebAssembly compilation, embedded systems, blockchain development, and high-performance web services with comprehensive tooling and best practices.

## Examples

### Example 1: High-Performance Web Service with Actix-Web
```rust
// Cargo.toml
[package]
name = "rust-web-service"
version = "0.1.0"
edition = "2021"

[dependencies]
actix-web = "4.4"
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "chrono", "uuid"] }
uuid = { version = "1.6", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
tracing = "0.1"
tracing-subscriber = "0.3"
anyhow = "1.0"
thiserror = "1.0"
config = "0.13"
redis = { version = "0.24", features = ["tokio-comp"] }

// src/main.rs
use actix_web::{web, App, HttpServer, Result, HttpResponse, middleware::Logger};
use sqlx::{PgPool, Row};
use std::sync::Arc;
use tracing::{info, error};

mod models;
mod handlers;
mod services;
mod config;
mod errors;

use models::*;
use handlers::*;
use services::*;
use config::AppConfig;
use errors::AppError;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: redis::Client,
    pub config: Arc<AppConfig>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    // Load configuration
    let config = Arc::new(AppConfig::from_env().expect("Failed to load configuration"));
    
    // Initialize database connection
    let database_url = &config.database_url;
    let db = PgPool::connect(database_url)
        .await
        .expect("Failed to connect to database");
    
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("Failed to run migrations");
    
    // Initialize Redis connection
    let redis_client = redis::Client::open(config.redis_url.as_str())
        .expect("Failed to create Redis client");
    
    let app_state = AppState {
        db,
        redis: redis_client,
        config: config.clone(),
    };
    
    info!("Starting server on {}:{}", config.host, config.port);
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .wrap(Logger::default())
            .service(
                web::scope("/api/v1")
                    .service(health_check)
                    .service(create_user)
                    .service(get_user)
                    .service(update_user)
                    .service(delete_user)
                    .service(list_users)
            )
    })
    .bind((config.host.as_str(), config.port))?
    .run()
    .await
}

// src/models.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub email: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

// src/handlers.rs
use actix_web::{web, HttpResponse, Result, get, post, put, delete};
use uuid::Uuid;
use tracing::{info, error};

use crate::{AppState, models::*, services::*, errors::AppError};

#[get("/health")]
pub async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now()
    })))
}

#[post("/users")]
pub async fn create_user(
    state: web::Data<AppState>,
    req: web::Json<CreateUserRequest>,
) -> Result<HttpResponse, AppError> {
    info!("Creating user with email: {}", req.email);
    
    let user_service = UserService::new(&state.db, &state.redis);
    let user = user_service.create_user(&req.email, &req.name).await?;
    
    Ok(HttpResponse::Created().json(UserResponse::from(user)))
}

#[get("/users/{id}")]
pub async fn get_user(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let user_id = path.into_inner();
    info!("Getting user with id: {}", user_id);
    
    let user_service = UserService::new(&state.db, &state.redis);
    let user = user_service.get_user(user_id).await?;
    
    Ok(HttpResponse::Ok().json(UserResponse::from(user)))
}

#[put("/users/{id}")]
pub async fn update_user(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateUserRequest>,
) -> Result<HttpResponse, AppError> {
    let user_id = path.into_inner();
    info!("Updating user with id: {}", user_id);
    
    let user_service = UserService::new(&state.db, &state.redis);
    let user = user_service.update_user(user_id, &req).await?;
    
    Ok(HttpResponse::Ok().json(UserResponse::from(user)))
}

#[delete("/users/{id}")]
pub async fn delete_user(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let user_id = path.into_inner();
    info!("Deleting user with id: {}", user_id);
    
    let user_service = UserService::new(&state.db, &state.redis);
    user_service.delete_user(user_id).await?;
    
    Ok(HttpResponse::NoContent().finish())
}

#[get("/users")]
pub async fn list_users(
    state: web::Data<AppState>,
    query: web::Query<ListUsersQuery>,
) -> Result<HttpResponse, AppError> {
    info!("Listing users with limit: {}, offset: {}", query.limit, query.offset);
    
    let user_service = UserService::new(&state.db, &state.redis);
    let users = user_service.list_users(query.limit, query.offset).await?;
    
    let response: Vec<UserResponse> = users.into_iter().map(UserResponse::from).collect();
    Ok(HttpResponse::Ok().json(response))
}

#[derive(serde::Deserialize)]
pub struct ListUsersQuery {
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

fn default_limit() -> i64 {
    20
}
```

### Example 2: Concurrent Data Processing with Tokio
```rust
// src/concurrent_processor.rs
use tokio::{sync::{mpsc, Semaphore}, time::{sleep, Duration}};
use std::sync::Arc;
use tracing::{info, error, warn};
use anyhow::{Result, Context};

pub struct ConcurrentProcessor<T> {
    max_concurrent: usize,
    semaphore: Arc<Semaphore>,
    processor_fn: Arc<dyn Fn(T) -> Result<()> + Send + Sync>,
}

impl<T> ConcurrentProcessor<T>
where
    T: Send + 'static,
{
    pub fn new<F>(max_concurrent: usize, processor_fn: F) -> Self
    where
        F: Fn(T) -> Result<()> + Send + Sync + 'static,
    {
        Self {
            max_concurrent,
            semaphore: Arc::new(Semaphore::new(max_concurrent)),
            processor_fn: Arc::new(processor_fn),
        }
    }
    
    pub async fn process_batch(&self, items: Vec<T>) -> Result<()> {
        let (tx, mut rx) = mpsc::channel(self.max_concurrent);
        
        // Spawn a task to send items
        let sender_handle = {
            let tx = tx.clone();
            tokio::spawn(async move {
                for item in items {
                    if tx.send(item).await.is_err() {
                        break;
                    }
                }
                drop(tx);
            })
        };
        
        // Process items concurrently
        let mut handles = Vec::new();
        
        while let Some(item) = rx.recv().await {
            let semaphore = self.semaphore.clone();
            let processor_fn = self.processor_fn.clone();
            
            let handle = tokio::spawn(async move {
                let _permit = semaphore.acquire().await.unwrap();
                
                match processor_fn(item) {
                    Ok(()) => info!("Successfully processed item"),
                    Err(e) => error!("Failed to process item: {}", e),
                }
            });
            
            handles.push(handle);
        }
        
        // Wait for all processing to complete
        for handle in handles {
            handle.await.context("Task panicked")?;
        }
        
        sender_handle.await.context("Sender task panicked")?;
        
        Ok(())
    }
}

// Example usage
#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    
    // Create a processor that simulates work
    let processor = ConcurrentProcessor::new(10, |item: i32| -> Result<()> {
        // Simulate some work
        std::thread::sleep(Duration::from_millis(100));
        
        if item % 10 == 0 {
            anyhow::bail!("Simulated error for item {}", item);
        }
        
        info!("Processed item: {}", item);
        Ok(())
    });
    
    // Process a batch of items
    let items: Vec<i32> = (1..=100).collect();
    processor.process_batch(items).await?;
    
    Ok(())
}
```

### Example 3: WebAssembly Module with wasm-bindgen
```rust
// Cargo.toml for WASM
[package]
name = "rust-wasm-module"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.4"
console_error_panic_hook = "0.1"
wee_alloc = "0.4"

[dependencies.web-sys]
version = "0.3"
features = [
  "console",
  "Document",
  "Element",
  "HtmlElement",
  "Window",
  "Performance",
  "CanvasRenderingContext2d",
  "HtmlCanvasElement",
  "ImageData",
]

// src/lib.rs
use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::{Deserialize, Serialize};

// Import the `console.log` function from the browser
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro for easier console logging
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// Set up panic hook for better error messages
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

// Use wee_alloc as the global allocator for smaller binary size
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize)]
pub struct Point {
    x: f64,
    y: f64,
}

#[derive(Serialize, Deserialize)]
pub struct ProcessingResult {
    processed_points: Vec<Point>,
    total_distance: f64,
    processing_time_ms: f64,
}

#[wasm_bindgen]
pub struct DataProcessor {
    points: Vec<Point>,
}

#[wasm_bindgen]
impl DataProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> DataProcessor {
        console_log!("Creating new DataProcessor");
        DataProcessor {
            points: Vec::new(),
        }
    }
    
    #[wasm_bindgen]
    pub fn add_point(&mut self, x: f64, y: f64) {
        self.points.push(Point { x, y });
        console_log!("Added point ({}, {})", x, y);
    }
    
    #[wasm_bindgen]
    pub fn process_data(&self) -> JsValue {
        let start_time = web_sys::window()
            .unwrap()
            .performance()
            .unwrap()
            .now();
        
        console_log!("Processing {} points", self.points.len());
        
        // Perform some complex processing
        let mut processed_points = Vec::new();
        let mut total_distance = 0.0;
        
        for (i, point) in self.points.iter().enumerate() {
            // Apply some transformation
            let processed_point = Point {
                x: point.x * 1.5 + (i as f64).sin(),
                y: point.y * 1.5 + (i as f64).cos(),
            };
            
            // Calculate distance from origin
            let distance = (processed_point.x.powi(2) + processed_point.y.powi(2)).sqrt();
            total_distance += distance;
            
            processed_points.push(processed_point);
        }
        
        let end_time = web_sys::window()
            .unwrap()
            .performance()
            .unwrap()
            .now();
        
        let processing_time = end_time - start_time;
        
        let result = ProcessingResult {
            processed_points,
            total_distance,
            processing_time_ms: processing_time,
        };
        
        console_log!("Processing completed in {:.2}ms", processing_time);
        
        serde_wasm_bindgen::to_value(&result).unwrap()
    }
    
    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.points.clear();
        console_log!("Cleared all points");
    }
    
    #[wasm_bindgen(getter)]
    pub fn point_count(&self) -> usize {
        self.points.len()
    }
}

// Advanced mathematical operations
#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0u64;
            let mut b = 1u64;
            for _ in 2..=n {
                let temp = a + b;
                a = b;
                b = temp;
            }
            b
        }
    }
}

#[wasm_bindgen]
pub fn prime_sieve(limit: u32) -> Vec<u32> {
    if limit < 2 {
        return vec![];
    }
    
    let mut is_prime = vec![true; (limit + 1) as usize];
    is_prime[0] = false;
    is_prime[1] = false;
    
    for i in 2..=((limit as f64).sqrt() as u32) {
        if is_prime[i as usize] {
            let mut j = i * i;
            while j <= limit {
                is_prime[j as usize] = false;
                j += i;
            }
        }
    }
    
    (2..=limit)
        .filter(|&i| is_prime[i as usize])
        .collect()
}

// Matrix operations for performance-critical computations
#[wasm_bindgen]
pub fn matrix_multiply(a: &[f64], b: &[f64], rows_a: usize, cols_a: usize, cols_b: usize) -> Vec<f64> {
    let mut result = vec![0.0; rows_a * cols_b];
    
    for i in 0..rows_a {
        for j in 0..cols_b {
            for k in 0..cols_a {
                result[i * cols_b + j] += a[i * cols_a + k] * b[k * cols_b + j];
            }
        }
    }
    
    result
}
```

## Instructions

### 1. Set Up Rust Development Environment

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install additional components
rustup component add clippy rustfmt
rustup target add wasm32-unknown-unknown

# Install useful tools
cargo install cargo-watch cargo-edit cargo-audit wasm-pack

# For web development
cargo install cargo-generate
```

### 2. Create High-Performance Web Service

```bash
# Create new Rust project
cargo new rust-web-service --bin
cd rust-web-service

# Add dependencies
cargo add actix-web tokio serde serde_json sqlx uuid chrono tracing tracing-subscriber anyhow thiserror config redis

# Add development dependencies
cargo add --dev tokio-test

# Set up database migrations
mkdir migrations
```

### 3. Implement Concurrent Processing

```rust
// Use Tokio for async runtime
use tokio::{sync::mpsc, task::JoinHandle};
use std::sync::Arc;

// Example: Concurrent file processing
async fn process_files_concurrently(file_paths: Vec<String>) -> Result<(), Box<dyn std::error::Error>> {
    let semaphore = Arc::new(tokio::sync::Semaphore::new(10)); // Limit to 10 concurrent operations
    let mut handles: Vec<JoinHandle<Result<(), Box<dyn std::error::Error + Send + Sync>>>> = Vec::new();
    
    for file_path in file_paths {
        let semaphore = semaphore.clone();
        let handle = tokio::spawn(async move {
            let _permit = semaphore.acquire().await?;
            // Process file here
            process_single_file(&file_path).await
        });
        handles.push(handle);
    }
    
    // Wait for all tasks to complete
    for handle in handles {
        handle.await??;
    }
    
    Ok(())
}
```

### 4. Build WebAssembly Modules

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Create WASM project
cargo generate --git https://github.com/rustwasm/wasm-pack-template
cd my-wasm-project

# Build for web
wasm-pack build --target web

# Build for Node.js
wasm-pack build --target nodejs

# Build for bundlers
wasm-pack build --target bundler
```

### 5. Implement Memory-Safe Systems Programming

```rust
use std::sync::{Arc, Mutex};
use std::thread;

// Safe shared state management
struct SafeCounter {
    value: Arc<Mutex<i32>>,
}

impl SafeCounter {
    fn new() -> Self {
        Self {
            value: Arc::new(Mutex::new(0)),
        }
    }
    
    fn increment(&self) {
        let mut value = self.value.lock().unwrap();
        *value += 1;
    }
    
    fn get(&self) -> i32 {
        *self.value.lock().unwrap()
    }
}

// Zero-copy string processing
fn process_string_slice(s: &str) -> &str {
    // Process without allocating new memory
    s.trim()
}
```

### 6. Performance Optimization and Profiling

```bash
# Profile with perf
cargo build --release
perf record --call-graph=dwarf ./target/release/my-app
perf report

# Use cargo flamegraph
cargo install flamegraph
cargo flamegraph --bin my-app

# Benchmark with criterion
cargo add --dev criterion
cargo bench
```

## Implementation Patterns

### Error Handling with thiserror and anyhow

```rust
use thiserror::Error;
use anyhow::{Result, Context};

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Redis error: {0}")]
    Redis(#[from] redis::RedisError),
    
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    #[error("Not found: {resource}")]
    NotFound { resource: String },
}

// Usage with anyhow for application errors
fn complex_operation() -> Result<String> {
    let data = fetch_data()
        .context("Failed to fetch initial data")?;
    
    let processed = process_data(data)
        .context("Failed to process data")?;
    
    Ok(processed)
}
```

### Async Traits and Advanced Patterns

```rust
use async_trait::async_trait;

#[async_trait]
pub trait Repository<T> {
    type Error;
    
    async fn find_by_id(&self, id: &str) -> Result<Option<T>, Self::Error>;
    async fn save(&self, entity: &T) -> Result<T, Self::Error>;
    async fn delete(&self, id: &str) -> Result<(), Self::Error>;
}

#[async_trait]
impl Repository<User> for UserRepository {
    type Error = sqlx::Error;
    
    async fn find_by_id(&self, id: &str) -> Result<Option<User>, Self::Error> {
        let user = sqlx::query_as!(
            User,
            "SELECT * FROM users WHERE id = $1",
            uuid::Uuid::parse_str(id).unwrap()
        )
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    async fn save(&self, user: &User) -> Result<User, Self::Error> {
        let saved_user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (id, email, name, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                updated_at = EXCLUDED.updated_at
            RETURNING *
            "#,
            user.id,
            user.email,
            user.name,
            user.created_at,
            user.updated_at
        )
        .fetch_one(&self.pool)
        .await?;
        
        Ok(saved_user)
    }
    
    async fn delete(&self, id: &str) -> Result<(), Self::Error> {
        sqlx::query!(
            "DELETE FROM users WHERE id = $1",
            uuid::Uuid::parse_str(id).unwrap()
        )
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
}
```

## Expected Output

### High-Performance Web Service
- Sub-millisecond response times for simple operations
- Memory-safe concurrent request handling
- Zero-copy string processing where possible
- Efficient database connection pooling
- Structured logging with tracing

### WebAssembly Module Performance
- Near-native performance in browsers
- Small binary sizes (< 100KB for typical modules)
- Seamless JavaScript interop
- Efficient memory management

### Systems Programming Benefits
- Memory safety without garbage collection
- Zero-cost abstractions
- Fearless concurrency
- Cross-platform compatibility

## Integration Points

Rust integrates seamlessly with various databases, web frameworks, and cloud services. The language's strong type system and async/await support make it ideal for building high-performance integrations with external systems. SQLx provides compile-time checked SQL queries, while libraries like `reqwest` enable efficient HTTP client implementations. Rust's ecosystem includes robust support for message queues, caching systems, and observability tools.

```rust
// Example integration patterns
use sqlx::PgPool;
use reqwest::Client;

// Database connection
let pool = PgPool::connect("postgresql://localhost/mydb").await?;

// HTTP client
let client = Client::new();
let response = client.get("https://api.example.com").send().await?;
```

### Database Integration
```rust
// SQLx with compile-time checked queries
let user = sqlx::query_as!(
    User,
    "SELECT id, email, name FROM users WHERE id = $1",
    user_id
)
.fetch_one(&pool)
.await?;
```

### Monitoring and Observability
```rust
use tracing::{info, error, instrument};

#[instrument(skip(db))]
async fn create_user(db: &PgPool, email: String) -> Result<User> {
    info!("Creating user with email: {}", email);
    // Implementation
}
```

## Security Considerations

Rust's ownership system provides memory safety guarantees at compile time, preventing common security vulnerabilities like buffer overflows, use-after-free, and data races. The type system enforces thread safety, making it impossible to have data races in safe Rust code. For cryptographic operations, the ecosystem provides audited libraries like ring and rustls. Secure coding practices include using the secrecy crate for sensitive data, proper error handling to avoid information leakage, and leveraging Rust's strong typing to prevent injection attacks.

### Memory Safety
- Automatic memory management without garbage collection
- Prevention of buffer overflows and use-after-free bugs
- Thread safety guaranteed by the type system

### Secure Coding Practices
```rust
// Use secrets crate for sensitive data
use secrecy::{Secret, ExposeSecret};

struct DatabaseConfig {
    password: Secret<String>,
}

// Secure random number generation
use rand::Rng;
let random_bytes: [u8; 32] = rand::thread_rng().gen();
```

## Performance Features

Rust delivers exceptional performance through zero-cost abstractions, where high-level constructs compile down to efficient machine code with no runtime overhead. The language provides fine-grained control over memory layout and allocation strategies, enabling developers to optimize for cache locality and minimize allocations. Rust's ownership system eliminates the need for garbage collection, resulting in predictable performance and low latency. SIMD support, inline assembly, and profile-guided optimization further enhance performance for compute-intensive workloads.

### Zero-Cost Abstractions
- Iterators compile to the same code as hand-written loops
- Generic functions are monomorphized at compile time
- No runtime overhead for safety guarantees

### Efficient Memory Usage
```rust
// Stack allocation for known-size data
let buffer: [u8; 1024] = [0; 1024];

// Heap allocation only when necessary
let dynamic_buffer: Vec<u8> = Vec::with_capacity(estimated_size);

// Zero-copy string slicing
let substring: &str = &full_string[start..end];
```
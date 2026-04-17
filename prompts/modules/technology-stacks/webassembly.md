# WebAssembly (WASM) Application Development

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
Comprehensive patterns for building high-performance web applications using WebAssembly, covering compilation, optimization, JavaScript interop, and deployment.

## Implementation Patterns

### Pattern 1: WASM Module Export and Calling
Export Rust functions to WASM and call from JavaScript.

**Implementation**:
1. Mark function with `#[wasm_bindgen]`
2. Implement function in Rust (compile to WASM)
3. Build WASM module: `wasm-pack build`
4. Import module in JavaScript: `import init, { function_name }`
5. Initialize WASM: `await init()`
6. Call function: `result = function_name(args)`
7. Handle async operations with Promises
8. Manage memory carefully (prevent leaks)

### Pattern 2: Performance-Critical Computation in WASM
Offload compute-intensive tasks to WASM for speed.

**Implementation**:
1. Identify bottleneck operations (can be CPU-bound)
2. Implement in Rust (WASM)
3. Benchmark: JS vs WASM version
4. If WASM > 2x faster, keep it
5. For data transfer, minimize serialization overhead
6. Use bulk operations (arrays in single call vs many small calls)
7. Monitor WASM memory usage
8. Profile and optimize hot WASM paths

### Pattern 3: Gradual WASM Adoption
Incrementally replace JS code with WASM.

**Implementation**:
1. Start with most CPU-intensive function
2. Write WASM version, expose via `#[wasm_bindgen]`
3. Update JavaScript to call WASM version
4. Test and benchmark
5. Measure improvement (latency, throughput, CPU)
6. Document improvement
7. Move to next function
8. Repeat until performance target reached or ROI diminishes

## Overview

WebAssembly is a binary instruction format that enables near-native performance in web browsers. It allows code written in languages like Rust, C++, and Go to run in the browser at near-native speed.

**Best For**: Performance-critical web apps, games, image/video processing, scientific computing, CAD tools

**Key Strengths**:
- Near-native performance (10-20x faster than JavaScript)
- Language agnostic (Rust, C++, Go, AssemblyScript)
- Secure sandbox execution
- Small binary sizes with compression
- Parallel execution with threads
- Direct memory access

**Considerations**:
- Learning curve for systems languages
- Limited DOM access (requires JS glue)
- Debugging can be challenging
- Larger initial download than JS (but faster execution)

## Technology Stack

### Core Technologies
```json
{
  "languages": ["Rust", "C++", "Go", "AssemblyScript"],
  "toolchains": {
    "rust": "wasm-pack, wasm-bindgen",
    "cpp": "Emscripten",
    "go": "TinyGo",
    "assemblyscript": "asc"
  },
  "runtime": "Browser WebAssembly API",
  "bundler": "Webpack, Vite, Rollup",
  "optimization": "wasm-opt, Binaryen",
  "testing": "wasm-bindgen-test, Node.js"
}
```

## Rust to WebAssembly

### 1. Project Setup

```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Create new project
cargo new --lib my-wasm-lib
cd my-wasm-lib

# Add to Cargo.toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
web-sys = { version = "0.3", features = ["console"] }
js-sys = "0.3"

[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
```

### 2. Basic Rust WASM Module

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

// Export function to JavaScript
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// Complex types
#[wasm_bindgen]
pub struct Calculator {
    value: f64,
}

#[wasm_bindgen]
impl Calculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Calculator {
        Calculator { value: 0.0 }
    }

    pub fn add(&mut self, x: f64) -> f64 {
        self.value += x;
        self.value
    }

    pub fn subtract(&mut self, x: f64) -> f64 {
        self.value -= x;
        self.value
    }

    pub fn get_value(&self) -> f64 {
        self.value
    }
}

// Console logging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn log_message(msg: &str) {
    log(&format!("WASM: {}", msg));
}
```

### 3. Build and Use

```bash
# Build for web
wasm-pack build --target web

# Build for Node.js
wasm-pack build --target nodejs

# Build for bundlers
wasm-pack build --target bundler
```

```typescript
// Using in TypeScript/JavaScript
import init, { add, greet, Calculator } from './pkg/my_wasm_lib.js';

async function main() {
  // Initialize WASM module
  await init();
  
  // Call functions
  console.log(add(5, 3)); // 8
  console.log(greet('World')); // "Hello, World!"
  
  // Use classes
  const calc = new Calculator();
  calc.add(10);
  calc.subtract(3);
  console.log(calc.get_value()); // 7
}

main();
```

## Advanced Patterns

### 4. JavaScript Interop

```rust
use wasm_bindgen::prelude::*;
use web_sys::{Document, Element, Window};

#[wasm_bindgen]
pub fn manipulate_dom() -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let body = document.body().expect("document should have a body");

    // Create element
    let val = document.create_element("p")?;
    val.set_inner_html("Hello from Rust!");

    body.append_child(&val)?;

    Ok(())
}

// Call JavaScript functions from Rust
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
    
    #[wasm_bindgen(js_name = setTimeout)]
    fn set_timeout(closure: &Closure<dyn FnMut()>, millis: u32) -> i32;
}

#[wasm_bindgen]
pub fn get_random() -> f64 {
    random()
}
```

### 5. Memory Management

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ImageProcessor {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> ImageProcessor {
        let pixels = vec![0; (width * height * 4) as usize];
        ImageProcessor { width, height, pixels }
    }

    // Return pointer to memory
    pub fn pixels_ptr(&self) -> *const u8 {
        self.pixels.as_ptr()
    }

    // Process image data
    pub fn grayscale(&mut self) {
        for chunk in self.pixels.chunks_mut(4) {
            let avg = (chunk[0] as u32 + chunk[1] as u32 + chunk[2] as u32) / 3;
            chunk[0] = avg as u8;
            chunk[1] = avg as u8;
            chunk[2] = avg as u8;
        }
    }
}
```

```typescript
// JavaScript side - zero-copy memory access
const processor = new ImageProcessor(800, 600);
const ptr = processor.pixels_ptr();
const memory = new Uint8Array(
  wasm_module.memory.buffer,
  ptr,
  800 * 600 * 4
);

// Modify pixels directly
for (let i = 0; i < memory.length; i += 4) {
  memory[i] = 255;     // R
  memory[i + 1] = 0;   // G
  memory[i + 2] = 0;   // B
  memory[i + 3] = 255; // A
}

// Process in WASM
processor.grayscale();
```

### 6. Async Operations

```rust
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

#[wasm_bindgen]
pub async fn fetch_data(url: String) -> Result<JsValue, JsValue> {
    let mut opts = RequestInit::new();
    opts.method("GET");

    let request = Request::new_with_str_and_init(&url, &opts)?;

    let window = web_sys::window().unwrap();
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;
    let resp: Response = resp_value.dyn_into()?;

    let json = JsFuture::from(resp.json()?).await?;
    Ok(json)
}
```

### 7. Multi-Threading with Web Workers

```rust
// Cargo.toml
[dependencies]
wasm-bindgen-rayon = "1.0"
rayon = "1.5"

// src/lib.rs
use wasm_bindgen::prelude::*;
use rayon::prelude::*;

#[wasm_bindgen]
pub fn parallel_sum(numbers: Vec<i32>) -> i32 {
    numbers.par_iter().sum()
}

#[wasm_bindgen]
pub fn parallel_map(numbers: Vec<i32>) -> Vec<i32> {
    numbers.par_iter()
        .map(|&x| x * 2)
        .collect()
}
```

```typescript
// Initialize with threads
import init, { initThreadPool, parallel_sum } from './pkg';

async function main() {
  await init();
  await initThreadPool(navigator.hardwareConcurrency);
  
  const numbers = Array.from({ length: 1000000 }, (_, i) => i);
  const sum = parallel_sum(numbers);
  console.log(sum);
}
```

## Performance Optimization

### 8. Size Optimization

```toml
# Cargo.toml
[profile.release]
opt-level = "z"           # Optimize for size
lto = true                # Link-time optimization
codegen-units = 1         # Better optimization
panic = "abort"           # Smaller binary
strip = true              # Strip symbols

[profile.release.package."*"]
opt-level = "z"
```

```bash
# Further optimize with wasm-opt
wasm-opt -Oz -o output.wasm input.wasm

# Compress with gzip/brotli
gzip -9 output.wasm
brotli -9 output.wasm
```

### 9. Benchmarking

```rust
use wasm_bindgen::prelude::*;
use web_sys::Performance;

#[wasm_bindgen]
pub struct Benchmark {
    performance: Performance,
}

#[wasm_bindgen]
impl Benchmark {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Benchmark {
        let window = web_sys::window().unwrap();
        let performance = window.performance().unwrap();
        Benchmark { performance }
    }

    pub fn start(&self) -> f64 {
        self.performance.now()
    }

    pub fn end(&self, start: f64) -> f64 {
        self.performance.now() - start
    }
}
```

### 10. Streaming Compilation

```typescript
// Stream and compile WASM for faster startup
async function loadWasmStreaming(url: string) {
  const response = await fetch(url);
  const { instance, module } = await WebAssembly.instantiateStreaming(response);
  return instance.exports;
}

// With caching
async function loadWasmWithCache(url: string) {
  const cache = await caches.open('wasm-cache-v1');
  
  let response = await cache.match(url);
  if (!response) {
    response = await fetch(url);
    await cache.put(url, response.clone());
  }
  
  const { instance } = await WebAssembly.instantiateStreaming(response);
  return instance.exports;
}
```

## Integration Patterns

### 11. React Integration

```typescript
// useWasm.ts
import { useEffect, useState } from 'react';
import init, * as wasm from './pkg';

export function useWasm() {
  const [loaded, setLoaded] = useState(false);
  const [wasmModule, setWasmModule] = useState<typeof wasm | null>(null);

  useEffect(() => {
    init().then(() => {
      setWasmModule(wasm);
      setLoaded(true);
    });
  }, []);

  return { loaded, wasm: wasmModule };
}

// Component usage
function ImageEditor() {
  const { loaded, wasm } = useWasm();

  if (!loaded) return <div>Loading WASM...</div>;

  const processImage = () => {
    const processor = new wasm.ImageProcessor(800, 600);
    processor.grayscale();
  };

  return <button onClick={processImage}>Process Image</button>;
}
```

### 12. Worker Integration

```typescript
// wasm-worker.ts
import init, { parallel_sum } from './pkg';

self.onmessage = async (e) => {
  await init();
  
  const result = parallel_sum(e.data);
  self.postMessage(result);
};

// Main thread
const worker = new Worker(new URL('./wasm-worker.ts', import.meta.url));

worker.postMessage([1, 2, 3, 4, 5]);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

## Best Practices

1. **Optimize for size** - WASM binaries can be large
2. **Use streaming compilation** for faster startup
3. **Minimize JS/WASM boundary crossings** - expensive
4. **Leverage zero-copy memory** when possible
5. **Use Web Workers** for CPU-intensive tasks
6. **Cache compiled modules** for repeat visits
7. **Profile performance** to identify bottlenecks
8. **Handle errors gracefully** across language boundaries
9. **Document memory management** clearly
10. **Test across browsers** for compatibility

## Common Use Cases

### Image Processing
```rust
#[wasm_bindgen]
pub fn apply_filter(pixels: &mut [u8], filter: &str) {
    match filter {
        "sepia" => apply_sepia(pixels),
        "blur" => apply_blur(pixels),
        "sharpen" => apply_sharpen(pixels),
        _ => {}
    }
}
```

### Game Logic
```rust
#[wasm_bindgen]
pub struct GameEngine {
    entities: Vec<Entity>,
    physics: PhysicsEngine,
}

#[wasm_bindgen]
impl GameEngine {
    pub fn update(&mut self, delta_time: f32) {
        self.physics.step(delta_time);
        for entity in &mut self.entities {
            entity.update(delta_time);
        }
    }
}
```

### Cryptography
```rust
use sha2::{Sha256, Digest};

#[wasm_bindgen]
pub fn hash_password(password: &str) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    hasher.finalize().to_vec()
}
```

## Related Modules

- `performance/optimization.md` - Performance patterns
- `technology-stacks/rust.md` - Rust development
- `deployment/cdn-deployment.md` - WASM distribution

## Examples

See `examples/webassembly/` for complete implementations:
- Image processing application
- Game engine with physics
- Cryptographic utilities
- Data visualization tool

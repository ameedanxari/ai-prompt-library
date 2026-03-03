## Purpose

Reference and patterns for using Rust in technology stacks, especially for WebAssembly and native modules.

## Implementation Patterns

### Pattern 1: Safe Interop
Use `wasm-bindgen` and `serde` for safe JavaScript interop.

### Pattern 2: Memory Management
Avoid leaks by careful ownership and using `Drop` semantics where appropriate.

## Examples

```markdown
Example: Export a Rust function to WASM using `#[wasm_bindgen]` and call from JS
```


## Deep Dive
Rust is often used for performance-critical modules and WebAssembly targets. Use `cargo` features to conditionally include or exclude dependencies. Leverage `wasm-pack` when compiling to WASM and choose `cdylib` or `rlib` depending on use case. Annotate unsafe blocks and review them carefully. When interoperating with JS, watch out for serialization costs and prefer simple data structures.

## Examples

```rust
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

# C++ High-Performance Computing Template

## Purpose

This template provides comprehensive patterns for building high-performance computing applications using modern C++, including parallel processing, memory optimization, scientific computing, and real-time systems. It covers enterprise-scale C++ development with advanced optimization techniques, SIMD operations, and GPU acceleration.

## Context

C++ remains the gold standard for high-performance computing, offering zero-overhead abstractions, direct hardware control, and maximum performance. This template addresses modern C++ development including C++20/23 features, parallel algorithms, vectorization, memory management, and integration with high-performance libraries like Intel MKL, CUDA, and OpenMP.

## Examples

### Example 1: High-Performance Matrix Operations with SIMD
```cpp
// CMakeLists.txt
cmake_minimum_required(VERSION 3.20)
project(HighPerformanceComputing CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(OpenMP REQUIRED)
find_package(Eigen3 REQUIRED)
find_package(IntelMKL QUIET)

add_executable(hpc_app
    src/main.cpp
    src/matrix_operations.cpp
    src/parallel_algorithms.cpp
    src/simd_operations.cpp
)

target_link_libraries(hpc_app 
    OpenMP::OpenMP_CXX 
    Eigen3::Eigen
    ${MKL_LIBRARIES}
)

target_compile_options(hpc_app PRIVATE
    -O3 -march=native -mtune=native
    -ffast-math -funroll-loops
    -DEIGEN_USE_MKL_ALL
)

// src/matrix_operations.hpp
#pragma once
#include <vector>
#include <memory>
#include <immintrin.h>
#include <omp.h>
#include <Eigen/Dense>

namespace hpc {

// SIMD-optimized matrix multiplication
class MatrixOperations {
public:
    // AVX2 optimized matrix multiplication
    static void multiply_avx2(
        const float* A, const float* B, float* C,
        size_t M, size_t N, size_t K
    ) {
        #pragma omp parallel for collapse(2)
        for (size_t i = 0; i < M; ++i) {
            for (size_t j = 0; j < N; j += 8) {
                __m256 sum = _mm256_setzero_ps();
                
                for (size_t k = 0; k < K; ++k) {
                    __m256 a = _mm256_broadcast_ss(&A[i * K + k]);
                    __m256 b = _mm256_loadu_ps(&B[k * N + j]);
                    sum = _mm256_fmadd_ps(a, b, sum);
                }
                
                _mm256_storeu_ps(&C[i * N + j], sum);
            }
        }
    }
    
    // Eigen-based high-performance operations
    static Eigen::MatrixXd multiply_eigen(
        const Eigen::MatrixXd& A,
        const Eigen::MatrixXd& B
    ) {
        return A * B;
    }
    
    // Parallel matrix transpose
    template<typename T>
    sllel(
        const std::vector<T>& input,
        std::vector<T>& output,
        size_t rows, size_t cols
    ) {
        #pragma omp parallel for
        for (size_t i = 0; i < rows; ++i) {
            for (size_t j = 0; j < cols; ++j) {
                output[j * rows + i] = input[i * cols + j];
            }
        }
    }
};

} // namespace hpc
```

### Example 2: Parallel Algorithms with OpenMP and TBB
```cpp
// src/parallel_algorithms.hpp
#pragma once
#include <vector>
#include <algorithm>
#include <execution>
#include <numeric>
#include <tbb/tbb.h>
#include <omp.h>

namespace hpc {

// Parallel sorting with C++17 execution policies
template<typename T>
void parallel_sort(std::vector<T>& data) {
    std::sort(std::execution::par_unseq, data.begin(), data.end());
}

// Parallel reduction with OpenMP
template<typename T>
T parallel_reduce_omp(const std::vector<T>& data) {
    T sum = 0;
    
    #pragma omp parallel for reduction(+:sum)
    for (size_t i = 0; i < data.size(); ++i) {
        sum += data[i];
    }
    
    return sum;
}

// Parallel map with TBB
template<typename T, typename Func>
std::vector<T> parallel_map_tbb(const std::vector<T>& input, Func func) {
    std::vector<T> output(input.size());
    
    tbb::parallel_for(
        tbb::blocked_range<size_t>(0, input.size()),
        [&](const tbb::blocked_range<size_t>& range) {
            for (size_t i = range.begin(); i < range.end(); ++i) {
                output[i] = func(input[i]);
            }
        }
    );
    
    return output;
}

// Parallel pipeline processing
class DataPipeline {
public:
    template<typename InputT, typename OutputT>
    static std::vector<OutputT> process(
        const std::vector<InputT>& input,
        size_t num_threads = std::thread::hardware_concurrency()
    ) {
        std::vector<OutputT> output;
        output.reserve(input.size());
        
        tbb::parallel_pipeline(
            num_threads,
            tbb::make_filter<void, InputT>(
                tbb::filter::serial_in_order,
        0)](tbb::flow_control& fc) mutable -> InputT {
                    if (i < input.size()) {
                        return input[i++];
                    } else {
                        fc.stop();
                        return InputT{};
                    }
                }
            ) &
            tbb::make_filter<InputT, OutputT>(
                tbb::filter::parallel,
                [](InputT item) -> OutputT {
                    return process_item(item);
                }
            ) &
            tbb::make_filter<OutputT, void>(
                tbb::filter::serial_in_order,
                [&](OutputT result) {
                    output.push_back(result);
                }
            )
        );
        
        return output;
    }
    
private:
    template<typename T>
    static T process_item(const T& item) {
        // Heavy processing
        return item * 2;
    }
};

} // namespace hpc
```

### Example 3: GPU Acceleration with CUDA
```cpp
// src/cuda_operations.cu
#inc>
#include <device_launch_parameters.h>
#include <iostream>
#include <vector>

namespace hpc {

// CUDA kernel for vector addition
__global__ void vector_add_kernel(
    const float* a, const float* b, float* c, size_t n
) {
    size_t idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

// CUDA kernel for matrix multiplication
__global__ void matrix_multiply_kernel(
    const float* A, const float* B, float* C,
    size_t M, size_t N, size_t K
) {
    size_t row = blockIdx.y * blockDim.y + threadIdx.y;
    size_t col = blockIdx.x * blockDim.x + threadIdx.x;
    
    if (row < M && col < N) {
        float sum = 0.0f;
        for (size_t k = 0; k < K; ++k) {
            sum += A[row * K + k] * B[k * N + col];
        }
        C[row * N + col] = sum;
    }
}

// CUDA wrapper class
class CudaOperations {
public:
    static void vector_add(
        const std::vector<float>& a,
        const std::vector<float>& b,
        std::vector<float>& c
    ) {
    ze_t n = a.size();
        size_t bytes = n * sizeof(float);
        
        // Allocate device memory
        float *d_a, *d_b, *d_c;
        cudaMalloc(&d_a, bytes);
        cudaMalloc(&d_b, bytes);
        cudaMalloc(&d_c, bytes);
        
        // Copy data to device
        cudaMemcpy(d_a, a.data(), bytes, cudaMemcpyHostToDevice);
        cudaMemcpy(d_b, b.data(), bytes, cudaMemcpyHostToDevice);
        
        // Launch kernel
        size_t threads_per_block = 256;
    _per_block - 1) / threads_per_block;
        vector_add_kernel<<<num_blocks, threads_per_block>>>(d_a, d_b, d_c, n);
        
        // Copy result back to host
        cudaMemcpy(c.data(), d_c, bytes, cudaMemcpyDeviceToHost);
        
        // Free device memory
        cudaFree(d_a);
        cudaFree(d_b);
        cudaFree(d_c);
    }
    
    static void matrix_multiply(
        const std::vector<float>& A,
        const std::vector<float>& B,
        std::vector<float>& C,
        size_t M, size_t N, size_t K
    ) {
        size_t bytes_A = M * K * sizeof(float);
        size_t bytes_B = K * N * sizeof(float);
        size_t bytes_C = M * N * sizeof(float);
        
        float *d_A, *d_B, *d_C;
        cudaMalloc(&d_A, bytes_A);
        cudaMalloc(&d_B, bytes_B);
        cudaMalloc(&d_C, bytes_C);
        
        cudaMemcpy(d_A, A.data(), bytes_A, cudaMemcpyHostToDevice);
        cudaMemcpy(d_B, B.data(), bytes_B, cudaMemcpyHostToDevice);
        
        dim3 threads_per_block(16, 16);
        dim3 num_blocks(
            (N + threads_per_block.x - 1) / threads_per_block.x,
            (M + threads_per_block.y - 1) / threads_per_block.y
        );
        
        matrix_multiply_kernel<<<num_blocks, threads_per_block>>>(
            d_A, d_B, d_C, M, N, K
        );
        
        cudaMemcpy(C.data(), d_C, bytes_C, cudaMemcpyDeviceToHost);
        
        cudaFree(d_A);
        cudaFree(d_B);
        cudaFree(d_C);
    }
};

} // namespace hpc
```

## Instructions

### 1. Set Up Cironment

```bash
# Install C++ compiler and build tools
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential cmake g++ gdb

# On macOS
xcode-select --install
brew install cmake

# Install OpenMP
# Ubuntu/Debian
sudo apt-get install libomp-dev

# macOS
brew install libomp

# Install Intel TBB
sudo apt-get install libtbb-dev  # Ubuntu/Debian
brew install tbb  # macOS

# Install Eigen
sudo apt-get install libeigen3-dev  # Ubuntu/Debian
brew install eigen  # macOS
```

### 2. Create New C++ Project

```bash
# Create project structure
mkdir cpp-hpc-project
cd cpp-hpc-project
mkdir -p src include tests build

# Create CMakeLists.txt
cat > CMakeLists.txt << 'EOF'
cmake_minimum_required(VERSION 3.20)
project(HPCProject CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -march=native")

find_package(OpenMP REQUIRED)
find_package(Eigen3 REQUIRED)
find_package(TBB REQUIRED)

add_executable(hpc_app src/main.cpp)
target_link_libraries(hpc_app OpenMP::OpenMP_CXX Eigen3::Eigen TBB::tbb)
EOF

# Build project
cmake -B build -S .
cmake --build build
```

### 3. Implement Memory-Efficient Algorithms

```cpp
// src/memory_pool.hpp
#pragma once
#include <memory>
#include <vector>
#include <cstddef>

namespace hpc {

// Custom memory pool for high-performance allocation
template<typename T, size_t BlockSize = 4096>
class MemoryPool {
public:
    MemoryPool() : current_block_(nullptr), current_slot_(0) {
        allocate_block();
    }
    
    ~MemoryPool() {
        for (auto* block : blocks_) {
            ::operator delete(block);
        }
    }
    
    T* allocate() {
        if (current_slot_ >= BlockSize) {
            allocate_block();
        }
        
        return &current_block_[current_slot_++];
    }
    
    void deallocate(T* ptr) {
        // Simple pool doesn't support individual deallocation
        // All memory is freed when pool is destroyed
    }
    
private:
    void allocate_block() {
   r new(BlockSize * sizeof(T)));
        blocks_.push_back(new_block);
        current_block_ = new_block;
        current_slot_ = 0;
    }
    
    std::vector<T*> blocks_;
    T* current_block_;
    size_t current_slot_;
};

} // namespace hpc
```

### 4. Implement Real-Time Systems Patterns

```cpp
// src/real_time_system.hpp
#pragma once
#include <chrono>
#include <thread>
#include <atomic>
#include <functional>

namespace hpc {

// Real-time task scheduler
class RealTimeScheduler {
public:
    using = std::function<void()>;
    using Duration = std::chrono::microseconds;
    
    RealTimeScheduler(Duration period) 
        : period_(period), running_(false) {}
    
    void start() {
        running_ = true;
        scheduler_thread_ = std::thread([this]() {
            auto next_wake = std::chrono::steady_clock::now();
            
            while (running_) {
                next_wake += period_;
                
                // Execute task
                if (task_) {
                    task_();
                }
                
                // Sleep until next period
                std::this_thread::sleep_until(next_wake);
            }
        });
    }
    
    void stop() {
        running_ = false;
        if (scheduler_thread_.joinable()) {
            scheduler_thread_.join();
        }
    }
    
    void set_task(Task task) {
        task_ = std::move(task);
    }
    
private:
    Duration period_;
    std::atomic<bool> running_;
    std::thread scheduler_thread_;
    Task task_;
};

} // namespace hpc
```

## Implementation Patterns

### Lock-Free Data Structures

```cpp
// src/lock_free_queue.hpp
#pragma once
#include <atomic>
#include <memory>

namespace hpc {

template<typename T>
class LockFreeQueue {
private:
    struct Node {
        std::shared_ptr<T> data;
        std::atomic<Node*> next;
        
        Node() : next(nullptr) {}
    };
    
    std::atomic<Node*> head_;
    std::atomic<Node*> tail_;
    
public:
    LockFreeQueue() {
        Node* dummy = new Node();
        head_.store(dummy);
        tail_.store(dummy);
    }
    
    ~LockFreeQueue() {
        while (Node* old_head = head_.load()) {
            head_.store(old_head->next);
            delete old_head;
        }
    }
    
    void push(T value) {
        auto data = std::make_shared<T>(std::move(value));
        Node* new_node = new Node();
        
        Node* old_tail = tail_.load();
        while (!tail_.compare_exchange_weak(old_tail, new_node)) {
            old_tail = tail_.load();
        }
        
        old_tail->data = data;
        old_tail->next.store(new_node);
    }
    
    std::shared_ptr<T> pop() {
        Node* old_head = head_.load();
        
        while (old_head != tail_.load()) {
            if (head_.compare_exchange_weak(old_head, old_head->next)) {
                std::shared_ptr<T> result = old_head->data;
                delete old_head;
                return result;
            }
        }
        
        return std::shared_ptr<T>();
    }
};

} // namespace hpc
```

he-Friendly Data Structures

```cpp
// src/cache_friendly.hpp
#pragma once
#include <vector>
#include <cstddef>

namespace hpc {

// Structure of Arrays (SoA) for better cache performance
template<typename... Types>
class StructureOfArrays {
public:
    template<size_t I>
   pect(!!(x), 0)

// Force inlining
#define FORCE_INLINE __attribute__((always_inline)) inline

// Restrict pointer aliasing
void process_arrays(float* __restrict__ a, float* __restrict__ b, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2.0f;
    }
}

// Alignment hints
alignas(64) float cache_aligned_array[1024];
```
          end - start_
        ).count();
        
        std::cout << name_ << ": " << duration << " μs" << std::endl;
    }
    
private:
    std::string name_;
    std::chrono::time_point<std::chrono::high_resolution_clock> start_;
};

// Usage
void expensive_operation() {
    PerformanceTimer timer("expensive_operation");
    // ... operation code ...
}
```

### Compiler Optimizations

```cpp
// Compiler hints for optimization
#define LIKELY(x)   __builtin_expect(!!(x), 1)
#define UNLIKELY(x) __builtin_ex
    
private:
    std::vector<T> data_;
};
```

## Performance Features

C++ delivers near-metal performance with zero-overhead abstractions, allowing developers to write high-level code that compiles to efficient machine instructions. The language supports SIMD vectorization for data-parallel operations, multi-threading with OpenMP and TBB for CPU parallelism, and GPU acceleration through CUDA and OpenCL. Advanced optimization techniques include template metaprogramming for compile-time computation, cache-friendly data structures, lock-free algorithms, and custom memory allocators for specific workload patterns.

### Profiling and Optimization

```cpp
// Performance measurement utilities
#include <chrono>
#include <iostream>

class PerformanceTimer {
public:
    PerformanceTimer(const std::string& name) 
        : name_(name), start_(std::chrono::high_resolution_clock::now()) {}
    
    ~PerformanceTimer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(
            end - start_
        ).count();
        
        std::cout << name_ << ": " << duration << " μs" << std::endl;
    }
    
private:
    std::string name_;
    std::chrono::time_point<std::chrono::high_resolution_clock> start_;
};

// Usage
void expensive_operation() {
    PerformanceTimer timer("expensive_operation");
    // ... operation code ...
}

// Compiler hints for optimization
#define LIKELY(x)   __builtin_expect(!!(x), 1)
#define UNLIKELY(x) __builtin_expect(!!(x), 0)

// Force inlining
#define FORCE_INLINE __attribute__((always_inline)) inline

// Restrict pointer aliasing
void process_arrays(float* __restrict__ a, float* __restrict__ b, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = b[i] * 2.0f;
    }
}

// Alignment hints
alignas(64) float cache_aligned_array[1024];
```

### Cache-Friendly Data Structures

```cpp
// src/cache_friendly.hpp
#pragma once
#include <vector>
#include <cstddef>

namespace hpc {

// Structure of Arrays (SoA) for better cache performance
template<typename... Types>
class StructureOfArrays {
public:
    template<size_t I>
    using TypeAt = typename std::tuple_element<I, std::tuple<Types...>>::type;
    
    void resize(size_t size) {
        resize_impl<0>(size);
    }
    
    size_t size() const {
        return std::get<0>(arrays_).size();
    }
    
    template<size_t I>
    auto& get() {
        return std::get<I>(arrays_);
    }
    
    template<size_t I>
    const auto& get() const {
        return std::get<I>(arrays_);
    }
    
private:
    std::tuple<std::vector<Types>...> arrays_;
    
    template<size_t I>
    void resize_impl(size_t size) {
        if constexpr (I < sizeof...(Types)) {
            std::get<I>(arrays_).resize(size);
            resize_impl<I + 1>(size);
        }
    }
};

} // namespace hpc
```

## Security Considerations

C++ requires careful attention to memory safety, as manual memory management can lead to vulnerabilities like buffer overflows, use-after-free, and memory leaks. Modern C++ provides RAII (Resource Acquisition Is Initialization) for automatic resource management, smart pointers to prevent memory leaks, and bounds-checking containers. Security best practices include input validation, using secure coding standards like CERT C++, static analysis tools, and address sanitizers to detect memory errors during development.

### Memory Safety

```cpp
// RAII for resource management
class ResourceGuard {
public:
    ResourceGuard(Resource* res) : resource_(res) {}
    
    ~ResourceGuard() {
        if (resource_) {
            release_resource(resource_);
        }
    }
    
    // Prevent copying
    ResourceGuard(const ResourceGuard&) = delete;
    ResourceGuard& operator=(const ResourceGuard&) = delete;
    
    // Allow moving
    ResourceGuard(ResourceGuard&& other) noexcept 
        : resource_(other.resource_) {
        other.resource_ = nullptr;
    }
    
private:
    Resource* resource_;
};
```

### Input Validation

```cpp
// Bounds checking and validation
template<typename T>
class SafeArray {
public:
    SafeArray(size_t size) : data_(size) {}
    
    T& at(size_t index) {
        if (index >= data_.size()) {
            throw std::out_of_range("Index out of bounds");
        }
        return data_[index];
    }
    
    const T& at(size_t index) const {
        if (index >= data_.size()) {
            throw std::out_of_range("Index out of bounds");
        }
        return data_[index];
    }
    
private:
    std::vector<T> data_;
};
```

## Integration Points

C++ integrates with a vast ecosystem of high-performance libraries and frameworks for scientific computing, graphics, networking, and system programming. Intel MKL and Eigen provide optimized linear algebra operations, while CUDA and OpenCL enable GPU acceleration. Boost.Asio offers cross-platform networking capabilities, and libraries like gRPC facilitate efficient inter-service communication. C++ seamlessly interoperates with C libraries and can expose C-compatible APIs for integration with other languages.

```cpp
// Example integration patterns
#include <boost/asio.hpp>
#include <grpc++/grpc++.h>

// Boost.Asio networking
boost::asio::io_context io_context;
boost::asio::ip::tcp::socket socket(io_context);

// gRPC service client
auto channel = grpc::CreateChannel("localhost:50051", grpc::InsecureChannelCredentials());
```

### Scientific Computing Libraries

```cpp
// Integration with Intel MKL
#include <mkl.h>

void matrix_multiply_mkl(
    const float* A, const float* B, float* C,
    size_t M, size_t N, size_t K
) {
    cblas_sgemm(
        CblasRowMajor, CblasNoTrans, CblasNoTrans,
        M, N, K,
        1.0f, A, K, B, N,
        0.0f, C, N
    );
}
```

### Networking and I/O

```cpp
// High-performance networking with Boost.Asio
#include <boost/asio.hpp>
#include <memory>

class AsyncTCPServer {
public:
    AsyncTCPServer(boost::asio::io_context& io_context, short port)
        : acceptor_(io_context, boost::asio::ip::tcp::endpoint(
            boost::asio::ip::tcp::v4(), port)) {
        start_accept();
    }
    
private:
    void start_accept() {
        auto socket = std::make_shared<boost::asio::ip::tcp::socket>(
            acceptor_.get_executor()
        );
        
        acceptor_.async_accept(*socket,
            [this, socket](const boost::system::error_code& error) {
                if (!error) {
                    handle_client(socket);
                }
                start_accept();
            }
        );
    }
    
    void handle_client(std::shared_ptr<boost::asio::ip::tcp::socket> socket) {
        // Handle client connection
    }
    
    boost::asio::ip::tcp::acceptor acceptor_;
};
```
) {
    cblas_sgemm(
        CblasRowMajor, CblasNoTrans, CblasNoTrans,
        M, N, K,
        1.0f, A, K, B, N,
        0.0f, C, N
    );
}
```

### Networking and I/O

```cpp
// High-performistics
- Near-metal performance with zero-overhead abstractions
- Efficient memory usage with custom allocators
- SIMD vectorization for data-parallel operations
- Multi-threaded parallelism with OpenMP and TBB
- GPU acceleration for massively parallel workloads

### Optimization Benefits
- Compile-time optimizations with templates
- Cache-friendly data structures
- Lock-free concurrent algorithms
- Memory pool allocation
- Branch prediction optimization

### Real-Time Capabilities
- Deterministic execution timese<size_t I>
    auto& get() {
        return std::get<I>(arrays_);
    }
    
    template<size_t I>
    const auto& get() const {
        return std::get<I>(arrays_);
    }
    
private:
    std::tuple<std::vector<Types>...> arrays_;
    
    template<size_t I>
    void resize_impl(size_t size) {
        if constexpr (I < sizeof...(Types)) {
            std::get<I>(arrays_).resize(size);
            resize_impl<I + 1>(size);
        }
    }
};

} // namespace hpc
```

## Expected Output

### Performance Character using TypeAt = typename std::tuple_element<I, std::tuple<Types...>>::type;
    
    void resize(size_t size) {
        resize_impl<0>(size);
    }
    
    size_t size() const {
        return std::get<0>(arrays_).size();
    }
    
    templat
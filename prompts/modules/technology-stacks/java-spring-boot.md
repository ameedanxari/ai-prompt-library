# Java Spring Boot Enterprise Technology Stack Template

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

This template provides comprehensive patterns for implementing enterprise-grade Java applications using Spring Boot, covering microservices architecture, security, data persistence, testing, and cloud deployment. It addresses the complexity of building scalable, maintainable, and secure enterprise applications with modern Java development practices.

## Context

Java Spring Boot remains the dominant choice for enterprise application development, offering a mature ecosystem for building production-ready applications. This template covers Spring Boot 3.x with Java 17+, including Spring Security, Spring Data JPA, Spring Cloud, reactive programming, and comprehensive testing strategies for enterprise-scale applications.

## Examples

### Example 1: Complete Spring Boot Application Setup
```java
// Main application class with comprehensive configuration
@SpringBootApplication
@EnableJpaRepositories
@EnableScheduling
@EnableCaching
public class EnterpriseApplication {
    public static void main(String[] args) {
        SpringApplication.run(EnterpriseApplication.class, args);
    }
}

// Configuration for production-ready features
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt)
            .build();
    }
}
```

### Example 2: Microservices Architecture
```java
// Service discovery and configuration
@EnableEurekaClient
@RefreshScope
@RestController
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/api/users/{id}")
    @PreAuthorize("hasPermission(#id, 'User', 'READ')")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(user -> ResponseEntity.ok(UserMapper.toDto(user)))
            .orElse(ResponseEntity.notFound().build());
    }
}

// Circuit breaker and resilience patterns
@Component
public class ExternalApiClient {
    
    @CircuitBreaker(name = "external-api", fallbackMethod = "fallbackResponse")
    @Retry(name = "external-api")
    @TimeLimiter(name = "external-api")
    public CompletableFuture<String> callExternalApi(String request) {
        return CompletableFuture.supplyAsync(() -> 
            restTemplate.postForObject("/api/external", request, String.class));
    }
    
    public CompletableFuture<String> fallbackResponse(String request, Exception ex) {
        return CompletableFuture.completedFuture("Fallback response");
    }
}
```

### Example 3: Reactive Programming with WebFlux
```java
// Reactive REST controller
@RestController
@RequestMapping("/api/reactive")
public class ReactiveController {
    
    @Autowired
    private ReactiveUserService userService;
    
    @GetMapping("/users")
    public Flux<UserDto> getAllUsers() {
        return userService.findAll()
            .map(UserMapper::toDto)
            .onErrorResume(throwable -> {
                log.error("Error fetching users", throwable);
                return Flux.empty();
            });
    }
    
    @PostMapping("/users")
    public Mono<ResponseEntity<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request)
            .map(user -> ResponseEntity.status(HttpStatus.CREATED).body(UserMapper.toDto(user)))
            .onErrorReturn(ResponseEntity.badRequest().build());
    }
}

// Reactive repository with R2DBC
@Repository
public interface ReactiveUserRepository extends ReactiveCrudRepository<User, Long> {
    
    @Query("SELECT * FROM users WHERE email = :email")
    Mono<User> findByEmail(String email);
    
    @Query("SELECT * FROM users WHERE status = :status ORDER BY created_at DESC")
    Flux<User> findByStatusOrderByCreatedAtDesc(UserStatus status);
}
```

## Instructions

### Spring Boot Application Architecture

Essential Spring Boot enterprise setup and configuration:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **Spring Boot Starter** | Critical | Web, Data JPA, Security | Core application |
| **Spring Security** | Critical | JWT, OAuth2, Method Security | Authentication/Authorization |
| **Spring Data JPA** | Critical | Repositories, Transactions | Data persistence |
| **Spring Cloud** | High | Config, Discovery, Gateway | Microservices |
| **Spring Boot Actuator** | High | Health checks, Metrics | Monitoring |
| **Spring Cache** | Medium | Redis, Caffeine | Performance |
| **Spring WebFlux** | Medium | Reactive programming | High throughput |
| **Spring Batch** | Low | Bulk processing | Data processing |

### Core Application Structure

```java
// src/main/java/com/company/app/Application.java
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.company.app.repository")
@EnableJpaAuditing
@EnableScheduling
@EnableCaching
@EnableAsync
public class Application {
    
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setDefaultProperties(getDefaultProperties());
        app.run(args);
    }
    
    private static Properties getDefaultProperties() {
        Properties properties = new Properties();
        properties.setProperty("spring.jpa.open-in-view", "false");
        properties.setProperty("spring.jpa.hibernate.ddl-auto", "validate");
        properties.setProperty("spring.datasource.hikari.maximum-pool-size", "20");
        return properties;
    }
    
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        return JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();
    }
    
    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

// src/main/java/com/company/app/config/DatabaseConfig.java
@Configuration
@EnableTransactionManagement
@Profile("!test")
public class DatabaseConfig {
    
    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource() {
        return DataSourceBuilder.create()
            .type(HikariDataSource.class)
            .build();
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(emf);
        return transactionManager;
    }
    
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
            .map(SecurityContext::getAuthentication)
            .filter(Authentication::isAuthenticated)
            .map(Authentication::getName);
    }
}

// src/main/java/com/company/app/config/SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Value("${app.security.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.security.jwt.expiration:86400}")
    private int jwtExpiration;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder())))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler(new HttpStatusEntryPoint(HttpStatus.FORBIDDEN)))
            .build();
    }
    
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(secretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    }
    
    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecret.getBytes()));
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
```

### Domain Model and Repository Layer

```java
// src/main/java/com/company/app/domain/User.java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_status", columnList = "status"),
    @Index(name = "idx_user_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "user_sequence", allocationSize = 1)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 255)
    @Email
    private String email;
    
    @Column(nullable = false, length = 100)
    @Size(min = 2, max = 100)
    private String firstName;
    
    @Column(nullable = false, length = 100)
    @Size(min = 2, max = 100)
    private String lastName;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<Role> roles = new HashSet<>();
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false, length = 255)
    private String createdBy;
    
    @LastModifiedBy
    @Column(length = 255)
    private String lastModifiedBy;
    
    @Version
    private Long version;
    
    // Constructors, getters, setters, equals, hashCode
    protected User() {}
    
    public User(String email, String firstName, String lastName, String passwordHash) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.passwordHash = passwordHash;
    }
    
    public void addRole(Role role) {
        this.roles.add(role);
    }
    
    public void removeRole(Role role) {
        this.roles.remove(role);
    }
    
    public boolean hasRole(Role role) {
        return this.roles.contains(role);
    }
    
    // Standard getters and setters...
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return Objects.equals(email, user.email);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(email);
    }
}

// src/main/java/com/company/app/domain/UserStatus.java
public enum UserStatus {
    ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
}

// src/main/java/com/company/app/domain/Role.java
public enum Role {
    USER, ADMIN, MODERATOR
}

// src/main/java/com/company/app/repository/UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.status = :status ORDER BY u.createdAt DESC")
    Page<User> findByStatusOrderByCreatedAtDesc(@Param("status") UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:name% OR u.lastName LIKE %:name%")
    List<User> findByNameContaining(@Param("name") String name);
    
    @Modifying
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
    int updateUserStatus(@Param("id") Long id, @Param("status") UserStatus status);
    
    @Query(value = "SELECT COUNT(*) FROM users WHERE created_at >= :since", nativeQuery = true)
    long countUsersCreatedSince(@Param("since") LocalDateTime since);
    
    boolean existsByEmail(String email);
}

// src/main/java/com/company/app/repository/UserSpecifications.java
public class UserSpecifications {
    
    public static Specification<User> hasStatus(UserStatus status) {
        return (root, query, criteriaBuilder) -> 
            status == null ? null : criteriaBuilder.equal(root.get("status"), status);
    }
    
    public static Specification<User> hasRole(Role role) {
        return (root, query, criteriaBuilder) -> 
            role == null ? null : criteriaBuilder.isMember(role, root.get("roles"));
    }
    
    public static Specification<User> createdAfter(LocalDateTime date) {
        return (root, query, criteriaBuilder) -> 
            date == null ? null : criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), date);
    }
    
    public static Specification<User> nameContains(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return null;
            }
            String pattern = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), pattern)
            );
        };
    }
}
```

### Service Layer with Business Logic

```java
// src/main/java/com/company/app/service/UserService.java
@Service
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    
    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Page<User> findAll(UserSearchCriteria criteria, Pageable pageable) {
        Specification<User> spec = Specification.where(null);
        
        if (criteria.getStatus() != null) {
            spec = spec.and(UserSpecifications.hasStatus(criteria.getStatus()));
        }
        
        if (criteria.getRole() != null) {
            spec = spec.and(UserSpecifications.hasRole(criteria.getRole()));
        }
        
        if (criteria.getCreatedAfter() != null) {
            spec = spec.and(UserSpecifications.createdAfter(criteria.getCreatedAfter()));
        }
        
        if (criteria.getName() != null) {
            spec = spec.and(UserSpecifications.nameContains(criteria.getName()));
        }
        
        return userRepository.findAll(spec, pageable);
    }
    
    @Transactional
    public User create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }
        
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getEmail(), request.getFirstName(), 
                           request.getLastName(), hashedPassword);
        
        user.addRole(Role.USER);
        User savedUser = userRepository.save(user);
        
        eventPublisher.publishEvent(new UserCreatedEvent(savedUser));
        return savedUser;
    }
    
    @Transactional
    public User update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        if (request.getStatus() != null && !request.getStatus().equals(user.getStatus())) {
            UserStatus oldStatus = user.getStatus();
            user.setStatus(request.getStatus());
            eventPublisher.publishEvent(new UserStatusChangedEvent(user, oldStatus, request.getStatus()));
        }
        
        return userRepository.save(user);
    }
    
    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        
        userRepository.delete(user);
        eventPublisher.publishEvent(new UserDeletedEvent(user));
    }
    
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }
        
        String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(newHashedPassword);
        userRepository.save(user);
        
        eventPublisher.publishEvent(new PasswordChangedEvent(user));
    }
    
    @Cacheable(value = "userStats", key = "'total'")
    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long newUsersThisMonth = userRepository.countUsersCreatedSince(
            LocalDateTime.now().minusMonths(1));
        
        return new UserStatistics(totalUsers, activeUsers, newUsersThisMonth);
    }
}

// src/main/java/com/company/app/service/dto/CreateUserRequest.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]",
             message = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character")
    private String password;
}

// src/main/java/com/company/app/service/dto/UserSearchCriteria.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchCriteria {
    private UserStatus status;
    private Role role;
    private String name;
    private LocalDateTime createdAfter;
}
```

### REST Controller Layer

```java
// src/main/java/com/company/app/controller/UserController.java
@RestController
@RequestMapping("/api/users")
@Validated
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdAfter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        UserSearchCriteria criteria = new UserSearchCriteria(status, role, name, createdAfter);
        Page<User> users = userService.findAll(criteria, pageable);
        Page<UserDto> userDtos = users.map(UserMapper::toDto);
        
        return ResponseEntity.ok(userDtos);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #id == authentication.principal.id)")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(user -> ResponseEntity.ok(UserMapper.toDto(user)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.create(request);
            UserDto userDto = UserMapper.toDto(user);
            
            URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(user.getId())
                .toUri();
            
            return ResponseEntity.created(location).body(userDto);
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #id == authentication.principal.id)")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, 
                                            @Valid @RequestBody UpdateUserRequest request) {
        try {
            User user = userService.update(id, request);
            return ResponseEntity.ok(UserMapper.toDto(user));
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #id == authentication.principal.id)")
    public ResponseEntity<Void> changePassword(@PathVariable Long id,
                                             @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(id, request);
            return ResponseEntity.ok().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (InvalidPasswordException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatistics> getUserStatistics() {
        UserStatistics stats = userService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }
}

// src/main/java/com/company/app/controller/dto/UserDto.java
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserStatus status;
    private Set<Role> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long version;
}

// src/main/java/com/company/app/controller/mapper/UserMapper.java
@Component
public class UserMapper {
    
    public static UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getStatus(),
            user.getRoles(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getVersion()
        );
    }
    
    public static List<UserDto> toDtoList(List<User> users) {
        return users.stream()
            .map(UserMapper::toDto)
            .collect(Collectors.toList());
    }
}
```

### Exception Handling and Validation

```java
// src/main/java/com/company/app/exception/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException e) {
        log.warn("User not found: {}", e.getMessage());
        ErrorResponse error = new ErrorResponse("USER_NOT_FOUND", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(UserAlreadyExistsException e) {
        log.warn("User already exists: {}", e.getMessage());
        ErrorResponse error = new ErrorResponse("USER_ALREADY_EXISTS", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        
        ValidationErrorResponse errorResponse = new ValidationErrorResponse("VALIDATION_FAILED", 
            "Request validation failed", errors);
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorResponse> handleConstraintViolation(ConstraintViolationException e) {
        log.warn("Constraint violation: {}", e.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        e.getConstraintViolations().forEach(violation -> 
            errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        
        ValidationErrorResponse errorResponse = new ValidationErrorResponse("CONSTRAINT_VIOLATION", 
            "Constraint validation failed", errors);
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        log.error("Data integrity violation", e);
        ErrorResponse error = new ErrorResponse("DATA_INTEGRITY_VIOLATION", 
            "Data integrity constraint violated");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        log.warn("Access denied: {}", e.getMessage());
        ErrorResponse error = new ErrorResponse("ACCESS_DENIED", "Access denied");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        log.error("Unexpected error occurred", e);
        ErrorResponse error = new ErrorResponse("INTERNAL_SERVER_ERROR", 
            "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

// src/main/java/com/company/app/exception/ErrorResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }
}

// src/main/java/com/company/app/exception/ValidationErrorResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidationErrorResponse extends ErrorResponse {
    private Map<String, String> fieldErrors;
    
    public ValidationErrorResponse(String code, String message, Map<String, String> fieldErrors) {
        super(code, message);
        this.fieldErrors = fieldErrors;
    }
}
```

### Testing Framework

```java
// src/test/java/com/company/app/service/UserServiceTest.java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private ApplicationEventPublisher eventPublisher;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        CreateUserRequest request = new CreateUserRequest("test@example.com", 
            "John", "Doe", "password123");
        String hashedPassword = "hashedPassword";
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        
        // When
        User result = userService.create(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(request.getEmail());
        assertThat(result.getFirstName()).isEqualTo(request.getFirstName());
        assertThat(result.getLastName()).isEqualTo(request.getLastName());
        assertThat(result.getPasswordHash()).isEqualTo(hashedPassword);
        assertThat(result.getRoles()).contains(Role.USER);
        
        verify(userRepository).existsByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
        verify(eventPublisher).publishEvent(any(UserCreatedEvent.class));
    }
    
    @Test
    void shouldThrowExceptionWhenUserAlreadyExists() {
        // Given
        CreateUserRequest request = new CreateUserRequest("existing@example.com", 
            "John", "Doe", "password123");
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> userService.create(request))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessageContaining("already exists");
        
        verify(userRepository).existsByEmail(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(eventPublisher, never()).publishEvent(any());
    }
    
    @Test
    void shouldUpdateUserSuccessfully() {
        // Given
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest("Jane", "Smith", UserStatus.ACTIVE);
        User existingUser = new User("test@example.com", "John", "Doe", "hashedPassword");
        existingUser.setId(userId);
        existingUser.setStatus(UserStatus.PENDING_VERIFICATION);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        User result = userService.update(userId, request);
        
        // Then
        assertThat(result.getFirstName()).isEqualTo(request.getFirstName());
        assertThat(result.getLastName()).isEqualTo(request.getLastName());
        assertThat(result.getStatus()).isEqualTo(request.getStatus());
        
        verify(userRepository).findById(userId);
        verify(userRepository).save(existingUser);
        verify(eventPublisher).publishEvent(any(UserStatusChangedEvent.class));
    }
}

// src/test/java/com/company/app/controller/UserControllerTest.java
@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @MockBean
    private JwtDecoder jwtDecoder;
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldGetAllUsers() throws Exception {
        // Given
        User user = new User("test@example.com", "John", "Doe", "hashedPassword");
        user.setId(1L);
        Page<User> userPage = new PageImpl<>(List.of(user));
        
        when(userService.findAll(any(UserSearchCriteria.class), any(Pageable.class)))
            .thenReturn(userPage);
        
        // When & Then
        mockMvc.perform(get("/api/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].email").value("test@example.com"))
                .andExpect(jsonPath("$.content[0].firstName").value("John"))
                .andExpect(jsonPath("$.content[0].lastName").value("Doe"));
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldCreateUser() throws Exception {
        // Given
        CreateUserRequest request = new CreateUserRequest("new@example.com", 
            "Jane", "Smith", "password123");
        User createdUser = new User(request.getEmail(), request.getFirstName(), 
            request.getLastName(), "hashedPassword");
        createdUser.setId(1L);
        
        when(userService.create(any(CreateUserRequest.class))).thenReturn(createdUser);
        
        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "new@example.com",
                        "firstName": "Jane",
                        "lastName": "Smith",
                        "password": "Password123!"
                    }
                    """))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }
    
    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnForbiddenWhenUserTriesToCreateUser() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "new@example.com",
                        "firstName": "Jane",
                        "lastName": "Smith",
                        "password": "Password123!"
                    }
                    """))
                .andExpect(status().isForbidden());
    }
}

// src/test/java/com/company/app/repository/UserRepositoryTest.java
@DataJpaTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb"
})
class UserRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void shouldFindUserByEmail() {
        // Given
        User user = new User("test@example.com", "John", "Doe", "hashedPassword");
        entityManager.persistAndFlush(user);
        
        // When
        Optional<User> found = userRepository.findByEmail("test@example.com");
        
        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        assertThat(found.get().getFirstName()).isEqualTo("John");
    }
    
    @Test
    void shouldReturnEmptyWhenUserNotFoundByEmail() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");
        
        // Then
        assertThat(found).isEmpty();
    }
    
    @Test
    void shouldFindUsersByStatus() {
        // Given
        User activeUser = new User("active@example.com", "Active", "User", "hashedPassword");
        activeUser.setStatus(UserStatus.ACTIVE);
        
        User inactiveUser = new User("inactive@example.com", "Inactive", "User", "hashedPassword");
        inactiveUser.setStatus(UserStatus.INACTIVE);
        
        entityManager.persist(activeUser);
        entityManager.persist(inactiveUser);
        entityManager.flush();
        
        // When
        Page<User> activeUsers = userRepository.findByStatusOrderByCreatedAtDesc(
            UserStatus.ACTIVE, PageRequest.of(0, 10));
        
        // Then
        assertThat(activeUsers.getContent()).hasSize(1);
        assertThat(activeUsers.getContent().get(0).getStatus()).isEqualTo(UserStatus.ACTIVE);
    }
}

// src/test/java/com/company/app/integration/UserIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@Transactional
class UserIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Test
    void shouldCreateAndRetrieveUser() {
        // Given
        CreateUserRequest request = new CreateUserRequest("integration@example.com", 
            "Integration", "Test", "Password123!");
        
        // When - Create user
        ResponseEntity<UserDto> createResponse = restTemplate
            .withBasicAuth("admin", "admin")
            .postForEntity("/api/users", request, UserDto.class);
        
        // Then - Verify creation
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).isNotNull();
        assertThat(createResponse.getBody().getEmail()).isEqualTo(request.getEmail());
        
        Long userId = createResponse.getBody().getId();
        
        // When - Retrieve user
        ResponseEntity<UserDto> getResponse = restTemplate
            .withBasicAuth("admin", "admin")
            .getForEntity("/api/users/" + userId, UserDto.class);
        
        // Then - Verify retrieval
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).isNotNull();
        assertThat(getResponse.getBody().getId()).isEqualTo(userId);
        assertThat(getResponse.getBody().getEmail()).isEqualTo(request.getEmail());
    }
}
```

## Implementation Patterns

### 1. Layered Architecture Pattern
Implement clean separation of concerns with distinct layers:
- **Presentation Layer**: REST controllers handling HTTP requests/responses
- **Service Layer**: Business logic and transaction management
- **Repository Layer**: Data access and persistence operations
- **Domain Layer**: Entity models and business rules

### 2. Dependency Injection Pattern
Leverage Spring's IoC container for loose coupling:
- Constructor injection for required dependencies
- Field injection for optional dependencies
- Configuration classes for bean definitions
- Profile-based configuration for environment-specific beans

### 3. Repository Pattern with Specifications
Implement flexible data access with Spring Data JPA:
- Custom repository interfaces extending JpaRepository
- Specification pattern for dynamic query building
- Criteria API for complex queries
- Pagination and sorting support

### 4. Event-Driven Architecture Pattern
Use application events for decoupled communication:
- Domain events for business logic notifications
- Event listeners for cross-cutting concerns
- Async event processing for performance
- Event sourcing for audit trails

### 5. Circuit Breaker Pattern
Implement resilience with Spring Cloud Circuit Breaker:
- Hystrix or Resilience4j integration
- Fallback methods for graceful degradation
- Timeout and retry configurations
- Health indicators for monitoring

### 6. Security Pattern Implementation
Comprehensive security with Spring Security:
- JWT token-based authentication
- Method-level authorization with @PreAuthorize
- Role-based access control (RBAC)
- CORS configuration for cross-origin requests

### 7. Testing Patterns
Multi-layered testing approach:
- Unit tests with Mockito for isolated testing
- Integration tests with @SpringBootTest
- Test containers for database testing
- MockMvc for web layer testing

### 8. Configuration Management Pattern
Externalized configuration with Spring Boot:
- application.yml for hierarchical configuration
- Profile-specific configurations
- Environment variable overrides
- @ConfigurationProperties for type-safe configuration

## Expected Output

This template will produce:

- **Complete Spring Boot Application**: Production-ready enterprise application with security, data persistence, and REST APIs
- **Microservices Architecture**: Service discovery, circuit breakers, and distributed configuration
- **Comprehensive Security**: JWT authentication, OAuth2 integration, and method-level authorization
- **Data Layer**: JPA repositories, specifications, auditing, and transaction management
- **Service Layer**: Business logic, event publishing, caching, and validation
- **REST Controllers**: RESTful APIs with proper HTTP status codes and error handling
- **Exception Handling**: Global exception handling with proper error responses
- **Testing Framework**: Unit tests, integration tests, and test containers
- **Performance Optimization**: Caching, connection pooling, and query optimization
- **Monitoring & Observability**: Actuator endpoints, metrics, and health checks

## Integration Points

- Connects with Spring Cloud modules for microservices architecture
- Integrates with modern deployment patterns for containerized applications
- Works with security modules for enterprise authentication and authorization
- Supports analytics modules for application monitoring and metrics
- Compatible with testing frameworks for comprehensive validation
- Integrates with Docker for containerization and deployment
- Supports Kubernetes for container orchestration and scaling
- Works with monitoring and observability platforms like Prometheus and Grafana

## Security Considerations

- JWT-based authentication with proper token validation and expiration
- Method-level security with role-based access control (RBAC)
- Password encryption using BCrypt with configurable strength
- SQL injection prevention through parameterized queries
- CORS configuration for cross-origin requests
- Input validation and sanitization at all layers

## Performance Features

- Connection pooling with HikariCP for optimal database performance
- JPA second-level caching with configurable cache providers
- Lazy loading and fetch strategies for optimal query performance
- Pagination and sorting for large datasets
- Async processing for non-blocking operations
- Database indexing strategies for query optimization

## Enterprise Features

- Audit trails with automatic created/modified tracking
- Soft delete patterns for data retention
- Optimistic locking for concurrent access control
- Event-driven architecture with application events
- Comprehensive logging with structured output
- Configuration externalization with Spring Boot profiles

This template provides a solid foundation for building enterprise-grade Java applications with Spring Boot, covering all aspects from development to production deployment with modern best practices and patterns.

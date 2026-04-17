# .NET Ecosystem Technology Stack Template

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

This template provides comprehensive patterns for implementing enterprise-grade .NET applications using ASP.NET Core, Entity Framework Core, and modern C# development practices. It covers web APIs, microservices architecture, authentication, data persistence, testing, and cloud deployment patterns for building scalable, maintainable, and secure .NET applications.

## Context

.NET has evolved into a cross-platform, high-performance framework for building modern applications. This template covers .NET 8+ with ASP.NET Core, Entity Framework Core, SignalR, Blazor, and comprehensive testing strategies for enterprise-scale applications with cloud-native deployment patterns.

## Examples

### Example 1: Complete ASP.NET Core Web API
```csharp
// Program.cs - Modern minimal API setup
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null);
            sqlOptions.CommandTimeout(30);
        }));

// Authentication and Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
});

// Dependency Injection
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Caching
builder.Services.AddMemoryCache();
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Enterprise API", 
        Version = "v1",
        Description = "A comprehensive .NET Core Web API"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddRedis(builder.Configuration.GetConnectionString("Redis"));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("https://localhost:3000", "https://app.example.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Enterprise API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigins");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Minimal API endpoints
app.MapGet("/api/status", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow })
    .WithName("GetStatus")
    .WithOpenApi();

app.Run();
```

### Example 2: Entity Framework Core with Domain Models
```csharp
// Models/User.cs - Domain entity with proper configuration
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

[Index(nameof(Email), IsUnique = true)]
public class User
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public UserStatus Status { get; set; } = UserStatus.Active;
    
    public List<UserRole> Roles { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? LastModifiedBy { get; set; }
    
    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    
    // Navigation properties
    public List<Order> Orders { get; set; } = new();
    public UserProfile? Profile { get; set; }
}

public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    PendingVerification
}

public enum UserRole
{
    User,
    Admin,
    Moderator
}

// Data/ApplicationDbContext.cs - DbContext with proper configuration
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Product> Products { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            
            // Configure enum collection
            entity.Property(e => e.Roles)
                .HasConversion(
                    v => string.Join(',', v.Select(r => r.ToString())),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                          .Select(r => Enum.Parse<UserRole>(r))
                          .ToList());
        });
        
        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Total).HasPrecision(18, 2);
            entity.Property(e => e.Status).HasConversion<string>();
            
            entity.HasOne(e => e.User)
                  .WithMany(e => e.Orders)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        
        // Seed data
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Email = "admin@example.com",
                FirstName = "System",
                LastName = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
    }
    
    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }
    
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }
    
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is User && (e.State == EntityState.Added || e.State == EntityState.Modified));
        
        foreach (var entry in entries)
        {
            if (entry.Entity is User user)
            {
                if (entry.State == EntityState.Added)
                {
                    user.CreatedAt = DateTime.UtcNow;
                }
                user.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
```

### Example 3: Repository Pattern with Specifications
```csharp
// Repositories/IUserRepository.cs - Repository interface
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<PagedResult<User>> GetPagedAsync(UserSearchCriteria criteria, int page, int pageSize);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> EmailExistsAsync(string email);
    Task<int> CountAsync(UserSearchCriteria criteria);
}

// Repositories/UserRepository.cs - Repository implementation
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserRepository> _logger;
    
    public UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
    
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }
    
    public async Task<PagedResult<User>> GetPagedAsync(UserSearchCriteria criteria, int page, int pageSize)
    {
        var query = _context.Users.AsQueryable();
        
        // Apply filters
        if (!string.IsNullOrEmpty(criteria.Email))
        {
            query = query.Where(u => u.Email.Contains(criteria.Email));
        }
        
        if (criteria.Status.HasValue)
        {
            query = query.Where(u => u.Status == criteria.Status.Value);
        }
        
        if (criteria.Roles?.Any() == true)
        {
            query = query.Where(u => criteria.Roles.Any(role => u.Roles.Contains(role)));
        }
        
        if (!string.IsNullOrEmpty(criteria.Name))
        {
            query = query.Where(u => u.FirstName.Contains(criteria.Name) || u.LastName.Contains(criteria.Name));
        }
        
        if (criteria.CreatedAfter.HasValue)
        {
            query = query.Where(u => u.CreatedAt >= criteria.CreatedAfter.Value);
        }
        
        // Get total count
        var totalCount = await query.CountAsync();
        
        // Apply pagination and sorting
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return new PagedResult<User>
        {
            Items = users,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        };
    }
    
    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created user with ID {UserId}", user.Id);
        return user;
    }
    
    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Updated user with ID {UserId}", user.Id);
        return user;
    }
    
    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted user with ID {UserId}", id);
        }
    }
    
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id);
    }
    
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }
    
    public async Task<int> CountAsync(UserSearchCriteria criteria)
    {
        var query = _context.Users.AsQueryable();
        
        // Apply same filters as GetPagedAsync
        if (!string.IsNullOrEmpty(criteria.Email))
        {
            query = query.Where(u => u.Email.Contains(criteria.Email));
        }
        
        if (criteria.Status.HasValue)
        {
            query = query.Where(u => u.Status == criteria.Status.Value);
        }
        
        return await query.CountAsync();
    }
}

// DTOs/UserSearchCriteria.cs - Search criteria
public class UserSearchCriteria
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public UserStatus? Status { get; set; }
    public List<UserRole>? Roles { get; set; }
    public DateTime? CreatedAfter { get; set; }
}

// DTOs/PagedResult.cs - Pagination result
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
```

### Example 4: Service Layer with Business Logic
```csharp
// Services/IUserService.cs - Service interface
public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> GetByEmailAsync(string email);
    Task<PagedResult<UserDto>> GetPagedAsync(UserSearchCriteria criteria, int page, int pageSize);
    Task<UserDto> CreateAsync(CreateUserRequest request);
    Task<UserDto> UpdateAsync(int id, UpdateUserRequest request);
    Task DeleteAsync(int id);
    Task<UserDto> ChangePasswordAsync(int id, ChangePasswordRequest request);
    Task<UserStatistics> GetStatisticsAsync();
}

// Services/UserService.cs - Service implementation
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;
    private readonly IMemoryCache _cache;
    
    public UserService(
        IUserRepository userRepository,
        IPasswordHasher<User> passwordHasher,
        IMapper mapper,
        ILogger<UserService> logger,
        IMemoryCache cache)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
        _logger = logger;
        _cache = cache;
    }
    
    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var cacheKey = $"user_{id}";
        
        if (_cache.TryGetValue(cacheKey, out UserDto? cachedUser))
        {
            return cachedUser;
        }
        
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return null;
        }
        
        var userDto = _mapper.Map<UserDto>(user);
        
        _cache.Set(cacheKey, userDto, TimeSpan.FromMinutes(15));
        
        return userDto;
    }
    
    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }
    
    public async Task<PagedResult<UserDto>> GetPagedAsync(UserSearchCriteria criteria, int page, int pageSize)
    {
        var result = await _userRepository.GetPagedAsync(criteria, page, pageSize);
        
        return new PagedResult<UserDto>
        {
            Items = _mapper.Map<List<UserDto>>(result.Items),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize,
            TotalPages = result.TotalPages
        };
    }
    
    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        // Validate email uniqueness
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new BusinessException($"User with email {request.Email} already exists");
        }
        
        // Create user entity
        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Status = UserStatus.Active,
            Roles = new List<UserRole> { UserRole.User }
        };
        
        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        
        // Save to database
        var createdUser = await _userRepository.CreateAsync(user);
        
        _logger.LogInformation("Created user {Email} with ID {UserId}", request.Email, createdUser.Id);
        
        return _mapper.Map<UserDto>(createdUser);
    }
    
    public async Task<UserDto> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {id} not found");
        }
        
        // Update properties
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        
        if (request.Status.HasValue && request.Status.Value != user.Status)
        {
            var oldStatus = user.Status;
            user.Status = request.Status.Value;
            _logger.LogInformation("Changed user {UserId} status from {OldStatus} to {NewStatus}", 
                id, oldStatus, request.Status.Value);
        }
        
        var updatedUser = await _userRepository.UpdateAsync(user);
        
        // Invalidate cache
        _cache.Remove($"user_{id}");
        
        return _mapper.Map<UserDto>(updatedUser);
    }
    
    public async Task DeleteAsync(int id)
    {
        if (!await _userRepository.ExistsAsync(id))
        {
            throw new NotFoundException($"User with ID {id} not found");
        }
        
        await _userRepository.DeleteAsync(id);
        
        // Invalidate cache
        _cache.Remove($"user_{id}");
        
        _logger.LogInformation("Deleted user with ID {UserId}", id);
    }
    
    public async Task<UserDto> ChangePasswordAsync(int id, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {id} not found");
        }
        
        // Verify current password
        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            throw new BusinessException("Current password is incorrect");
        }
        
        // Hash new password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        
        var updatedUser = await _userRepository.UpdateAsync(user);
        
        _logger.LogInformation("Changed password for user {UserId}", id);
        
        return _mapper.Map<UserDto>(updatedUser);
    }
    
    public async Task<UserStatistics> GetStatisticsAsync()
    {
        const string cacheKey = "user_statistics";
        
        if (_cache.TryGetValue(cacheKey, out UserStatistics? cachedStats))
        {
            return cachedStats!;
        }
        
        var totalUsers = await _userRepository.CountAsync(new UserSearchCriteria());
        var activeUsers = await _userRepository.CountAsync(new UserSearchCriteria { Status = UserStatus.Active });
        var newUsersThisMonth = await _userRepository.CountAsync(new UserSearchCriteria 
        { 
            CreatedAfter = DateTime.UtcNow.AddMonths(-1) 
        });
        
        var statistics = new UserStatistics
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            NewUsersThisMonth = newUsersThisMonth
        };
        
        _cache.Set(cacheKey, statistics, TimeSpan.FromMinutes(30));
        
        return statistics;
    }
}

// Exceptions/BusinessException.cs - Custom exceptions
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message) { }
    public BusinessException(string message, Exception innerException) : base(message, innerException) { }
}

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}
```

### Example 5: Controllers with Proper Error Handling
```csharp
// Controllers/UsersController.cs - API Controller
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;
    
    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }
    
    /// <summary>
    /// Get all users with pagination and filtering
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,User")]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
        [FromQuery] UserSearchCriteria criteria,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;
        
        var result = await _userService.GetPagedAsync(criteria, page, pageSize);
        return Ok(result);
    }
    
    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,User")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new { Message = $"User with ID {id} not found" });
        }
        
        return Ok(user);
    }
    
    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var user = await _userService.CreateAsync(request);
            
            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                user);
        }
        catch (BusinessException ex)
        {
            return Conflict(new { Message = ex.Message });
        }
    }
    
    /// <summary>
    /// Update an existing user
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _userService.UpdateAsync(id, request);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }
    
    /// <summary>
    /// Delete a user
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            await _userService.DeleteAsync(id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }
    
    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("{id:int}/change-password")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
    {
        // Users can only change their own password unless they're admin
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (currentUserId != id && !User.IsInRole("Admin"))
        {
            return Forbid();
        }
        
        try
        {
            var user = await _userService.ChangePasswordAsync(id, request);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    /// <summary>
    /// Get user statistics
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserStatistics), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserStatistics>> GetStatistics()
    {
        var statistics = await _userService.GetStatisticsAsync();
        return Ok(statistics);
    }
}

// Middleware/GlobalExceptionMiddleware.cs - Global exception handling
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    
    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new
        {
            Message = "An error occurred while processing your request",
            Details = exception.Message,
            Timestamp = DateTime.UtcNow
        };
        
        switch (exception)
        {
            case NotFoundException:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                response = new { Message = exception.Message, Timestamp = DateTime.UtcNow };
                break;
            case BusinessException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                response = new { Message = exception.Message, Timestamp = DateTime.UtcNow };
                break;
            case UnauthorizedAccessException:
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                response = new { Message = "Unauthorized access", Timestamp = DateTime.UtcNow };
                break;
            default:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                break;
        }
        
        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        await context.Response.WriteAsync(jsonResponse);
    }
}
```

### Example 6: Testing Framework
```csharp
// Tests/UserServiceTests.cs - Unit tests
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepository;
    private readonly Mock<IPasswordHasher<User>> _mockPasswordHasher;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly Mock<IMemoryCache> _mockCache;
    private readonly UserService _userService;
    
    public UserServiceTests()
    {
        _mockRepository = new Mock<IUserRepository>();
        _mockPasswordHasher = new Mock<IPasswordHasher<User>>();
        _mockMapper = new Mock<IMapper>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _mockCache = new Mock<IMemoryCache>();
        
        _userService = new UserService(
            _mockRepository.Object,
            _mockPasswordHasher.Object,
            _mockMapper.Object,
            _mockLogger.Object,
            _mockCache.Object);
    }
    
    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUserDto()
    {
        // Arrange
        var userId = 1;
        var user = new User { Id = userId, Email = "test@example.com", FirstName = "John", LastName = "Doe" };
        var userDto = new UserDto { Id = userId, Email = "test@example.com", FirstName = "John", LastName = "Doe" };
        
        _mockRepository.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _mockMapper.Setup(m => m.Map<UserDto>(user)).Returns(userDto);
        
        object? cachedValue = null;
        _mockCache.Setup(c => c.TryGetValue(It.IsAny<object>(), out cachedValue)).Returns(false);
        _mockCache.Setup(c => c.Set(It.IsAny<object>(), It.IsAny<object>(), It.IsAny<TimeSpan>()));
        
        // Act
        var result = await _userService.GetByIdAsync(userId);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
        Assert.Equal("test@example.com", result.Email);
        
        _mockRepository.Verify(r => r.GetByIdAsync(userId), Times.Once);
        _mockMapper.Verify(m => m.Map<UserDto>(user), Times.Once);
    }
    
    [Fact]
    public async Task CreateAsync_ValidRequest_ReturnsUserDto()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Email = "new@example.com",
            FirstName = "Jane",
            LastName = "Smith",
            Password = "Password123!"
        };
        
        var user = new User
        {
            Id = 1,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = "hashedPassword"
        };
        
        var userDto = new UserDto
        {
            Id = 1,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };
        
        _mockRepository.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(false);
        _mockPasswordHasher.Setup(h => h.HashPassword(It.IsAny<User>(), request.Password)).Returns("hashedPassword");
        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync(user);
        _mockMapper.Setup(m => m.Map<UserDto>(user)).Returns(userDto);
        
        // Act
        var result = await _userService.CreateAsync(request);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(request.Email, result.Email);
        Assert.Equal(request.FirstName, result.FirstName);
        Assert.Equal(request.LastName, result.LastName);
        
        _mockRepository.Verify(r => r.EmailExistsAsync(request.Email), Times.Once);
        _mockPasswordHasher.Verify(h => h.HashPassword(It.IsAny<User>(), request.Password), Times.Once);
        _mockRepository.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Once);
    }
    
    [Fact]
    public async Task CreateAsync_ExistingEmail_ThrowsBusinessException()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Email = "existing@example.com",
            FirstName = "Jane",
            LastName = "Smith",
            Password = "Password123!"
        };
        
        _mockRepository.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(true);
        
        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(() => _userService.CreateAsync(request));
        Assert.Contains("already exists", exception.Message);
        
        _mockRepository.Verify(r => r.EmailExistsAsync(request.Email), Times.Once);
        _mockRepository.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
    }
}

// Tests/Integration/UsersControllerIntegrationTests.cs - Integration tests
public class UsersControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public UsersControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }
    
    [Fact]
    public async Task GetUsers_WithValidToken_ReturnsUsers()
    {
        // Arrange
        var token = await GetValidJwtToken();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        // Act
        var response = await _client.GetAsync("/api/users");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResult<UserDto>>(content, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        Assert.NotNull(result);
        Assert.True(result.TotalCount >= 0);
    }
    
    [Fact]
    public async Task CreateUser_ValidRequest_ReturnsCreatedUser()
    {
        // Arrange
        var token = await GetAdminJwtToken();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var request = new CreateUserRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            FirstName = "Test",
            LastName = "User",
            Password = "Password123!"
        };
        
        var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        // Act
        var response = await _client.PostAsync("/api/users", content);
        
        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<UserDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        Assert.NotNull(user);
        Assert.Equal(request.Email, user.Email);
        Assert.Equal(request.FirstName, user.FirstName);
        Assert.Equal(request.LastName, user.LastName);
    }
    
    private async Task<string> GetValidJwtToken()
    {
        // Implementation to get a valid JWT token for testing
        // This would typically involve calling your authentication endpoint
        return "valid-jwt-token";
    }
    
    private async Task<string> GetAdminJwtToken()
    {
        // Implementation to get an admin JWT token for testing
        return "admin-jwt-token";
    }
}
```

## Instructions

### .NET Application Architecture

Essential .NET components and configurations:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **ASP.NET Core** | Critical | Web API, MVC | Web applications |
| **Entity Framework Core** | Critical | Code-first, Database-first | Data persistence |
| **Authentication** | Critical | JWT, Identity, OAuth2 | Security |
| **Dependency Injection** | Critical | Built-in container | Service management |
| **Caching** | High | Memory, Redis | Performance |
| **Logging** | High | Serilog, NLog | Observability |
| **Testing** | High | xUnit, NUnit, MSTest | Quality assurance |
| **API Documentation** | Medium | Swagger/OpenAPI | Documentation |

## Implementation Patterns

### 1. Clean Architecture Pattern
```csharp
// Domain Layer - Core business entities
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    // Business logic methods
}

// Application Layer - Use cases and services
public interface IUserService
{
    Task<UserDto> CreateAsync(CreateUserRequest request);
    Task<UserDto> GetByIdAsync(int id);
}

// Infrastructure Layer - Data access and external services
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    // Implementation details
}

// Presentation Layer - Controllers and API endpoints
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    // Controller actions
}
```

### 2. Repository Pattern with Unit of Work
```csharp
// Generic repository interface
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// Unit of Work pattern
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IOrderRepository Orders { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

### 3. CQRS Pattern with MediatR
```csharp
// Command for write operations
public class CreateUserCommand : IRequest<UserDto>
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

// Query for read operations
public class GetUserQuery : IRequest<UserDto>
{
    public int Id { get; set; }
}

// Command handler
public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Implementation
    }
}
```

### 4. Middleware Pipeline Pattern
```csharp
// Custom middleware
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogInformation("Request: {Method} {Path}", context.Request.Method, context.Request.Path);
        await _next(context);
        _logger.LogInformation("Response: {StatusCode}", context.Response.StatusCode);
    }
}

// Register middleware in Program.cs
app.UseMiddleware<RequestLoggingMiddleware>();
```

### 5. Options Pattern for Configuration
```csharp
// Configuration class
public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string SecretKey { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int ExpirationMinutes { get; set; }
}

// Register in Program.cs
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

// Inject in service
public class TokenService
{
    private readonly JwtOptions _jwtOptions;
    
    public TokenService(IOptions<JwtOptions> jwtOptions)
    {
        _jwtOptions = jwtOptions.Value;
    }
}
```

### 6. Background Service Pattern
```csharp
// Background service for periodic tasks
public class EmailNotificationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(IServiceProvider serviceProvider, ILogger<EmailNotificationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            
            await emailService.SendPendingEmailsAsync();
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}
```

## Expected Output

This template will produce:

- **Complete ASP.NET Core Web API**: Production-ready API with authentication, authorization, and comprehensive error handling
- **Entity Framework Core Integration**: Proper domain models, DbContext configuration, and database migrations
- **Repository Pattern**: Clean data access layer with specifications and pagination support
- **Service Layer**: Business logic implementation with caching, validation, and exception handling
- **RESTful Controllers**: Properly documented API endpoints with OpenAPI/Swagger integration
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Comprehensive Testing**: Unit tests, integration tests, and test fixtures
- **Performance Optimization**: Caching strategies, connection pooling, and query optimization
- **Monitoring & Logging**: Structured logging, health checks, and performance metrics

## Integration Points

- Connects with containerization modules for Docker deployment
- Integrates with Kubernetes modules for container orchestration
- Works with CI/CD modules for automated deployment pipelines
- Supports cloud platform modules for Azure, AWS, and GCP deployment
- Compatible with monitoring modules for application observability

## Security Considerations

- JWT-based authentication with proper token validation
- Role-based authorization with fine-grained permissions
- Password hashing using ASP.NET Core Identity password hasher
- Input validation and sanitization at all layers
- CORS configuration for cross-origin requests
- HTTPS enforcement and security headers

## Performance Features

- Entity Framework Core with connection pooling and retry policies
- Memory caching and distributed caching with Redis
- Async/await patterns throughout the application
- Pagination and filtering for large datasets
- Database indexing strategies for optimal query performance
- Response compression and output caching

## Enterprise Features

- Comprehensive error handling with global exception middleware
- Structured logging with Serilog integration
- Health checks for application and dependencies monitoring
- API versioning and backward compatibility
- OpenAPI documentation with Swagger UI
- Configuration management with multiple environments

This template provides a solid foundation for building enterprise-grade .NET applications with modern C# development practices, comprehensive testing, and production-ready deployment configurations.

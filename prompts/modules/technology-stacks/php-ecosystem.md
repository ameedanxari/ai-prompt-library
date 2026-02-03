# PHP Ecosystem Technology Stack Template

## Purpose

This template provides comprehensive patterns for implementing modern PHP applications using Laravel, Symfony, and contemporary PHP development practices. It covers RESTful APIs, microservices architecture, authentication, data persistence, testing, and cloud deployment patterns for building scalable, maintainable, and secure PHP applications.

## Context

PHP has evolved significantly with modern frameworks like Laravel and Symfony, offering robust ecosystems for enterprise development. This template covers PHP 8.2+ with Laravel 10+, Symfony 6+, comprehensive testing strategies, and modern development practices including dependency injection, event-driven architecture, and cloud-native deployment patterns.

## Examples

### Example 1: Complete Laravel Application Setup
```php
<?php
// composer.json - Modern Laravel dependencies
{
    "name": "company/web-application",
    "type": "project",
    "description": "Modern Laravel application with enterprise features",
    "keywords": ["laravel", "framework", "api", "enterprise"],
    "license": "MIT",
    "require": {
        "php": "^8.2",
        "laravel/framework": "^10.0",
        "laravel/sanctum": "^3.2",
        "laravel/horizon": "^5.15",
        "laravel/telescope": "^4.14",
        "spatie/laravel-permission": "^5.10",
        "spatie/laravel-query-builder": "^5.2",
        "spatie/laravel-activitylog": "^4.7",
        "league/fractal": "^0.20",
        "predis/predis": "^2.1",
        "pusher/pusher-php-server": "^7.2",
        "laravel/socialite": "^5.6"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "mockery/mockery": "^1.5",
        "nunomaduro/collision": "^7.0",
        "phpstan/phpstan": "^1.10",
        "laravel/pint": "^1.8",
        "fakerphp/faker": "^1.21",
        "laravel/sail": "^1.21"
    },
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    }
}

// config/app.php - Application configuration
<?php
return [
    'name' => env('APP_NAME', 'Laravel Enterprise'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'asset_url' => env('ASSET_URL'),
    'timezone' => 'UTC',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',

    'providers' => [
        // Laravel Framework Service Providers
        Illuminate\Auth\AuthServiceProvider::class,
        Illuminate\Broadcasting\BroadcastServiceProvider::class,
        Illuminate\Bus\BusServiceProvider::class,
        Illuminate\Cache\CacheServiceProvider::class,
        Illuminate\Foundation\Providers\ConsoleSupportServiceProvider::class,
        Illuminate\Cookie\CookieServiceProvider::class,
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Encryption\EncryptionServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Hashing\HashServiceProvider::class,
        Illuminate\Mail\MailServiceProvider::class,
        Illuminate\Notifications\NotificationServiceProvider::class,
        Illuminate\Pagination\PaginationServiceProvider::class,
        Illuminate\Pipeline\PipelineServiceProvider::class,
        Illuminate\Queue\QueueServiceProvider::class,
        Illuminate\Redis\RedisServiceProvider::class,
        Illuminate\Auth\Passwords\PasswordResetServiceProvider::class,
        Illuminate\Session\SessionServiceProvider::class,
        Illuminate\Translation\TranslationServiceProvider::class,
        Illuminate\Validation\ValidationServiceProvider::class,
        Illuminate\View\ViewServiceProvider::class,

        // Package Service Providers
        Laravel\Sanctum\SanctumServiceProvider::class,
        Laravel\Horizon\HorizonServiceProvider::class,
        Spatie\Permission\PermissionServiceProvider::class,
        Spatie\Activitylog\ActivitylogServiceProvider::class,

        // Application Service Providers
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\EventServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
        App\Providers\RepositoryServiceProvider::class,
    ],

    'aliases' => Facade::defaultAliases()->merge([
        // Custom aliases
    ])->toArray(),
];

// app/Providers/AppServiceProvider.php - Service provider configuration
<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Resources\Json\JsonResource;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if ($this->app->environment('local')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);
        JsonResource::withoutWrapping();
        
        // Sanctum configuration
        Sanctum::usePersonalAccessTokenModel(\App\Models\PersonalAccessToken::class);
        
        // Custom validation rules
        Validator::extend('strong_password', function ($attribute, $value, $parameters, $validator) {
            return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/', $value);
        });
    }
}
```

### Example 2: Eloquent Models with Relationships
```php
<?php
// app/Models/User.php - User model with comprehensive features
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'status',
        'email_verified_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'status' => UserStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', UserStatus::ACTIVE);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('name', $role);
        });
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%");
        });
    }

    // Accessors & Mutators
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->full_name ?: $this->email;
    }

    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = bcrypt($value);
    }

    // Methods
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function canModerate(): bool
    {
        return $this->hasAnyRole(['admin', 'moderator']);
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::ACTIVE;
    }

    // Activity Log
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'email', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::created(function ($user) {
            $user->assignRole('user');
            $user->profile()->create();
        });
    }
}

// app/Enums/UserStatus.php - User status enum
<?php
namespace App\Enums;

enum UserStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case SUSPENDED = 'suspended';
    case PENDING_VERIFICATION = 'pending_verification';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
            self::SUSPENDED => 'Suspended',
            self::PENDING_VERIFICATION => 'Pending Verification',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::ACTIVE => 'green',
            self::INACTIVE => 'gray',
            self::SUSPENDED => 'red',
            self::PENDING_VERIFICATION => 'yellow',
        };
    }
}

// app/Models/Order.php - Order model with state management
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
        'currency',
        'notes',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'total_amount' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items')
                    ->withPivot(['quantity', 'unit_price'])
                    ->withTimestamps();
    }

    // Scopes
    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    // State management methods
    public function canBeConfirmed(): bool
    {
        return $this->status === OrderStatus::PENDING;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            OrderStatus::PENDING,
            OrderStatus::CONFIRMED,
            OrderStatus::PROCESSING
        ]);
    }

    public function canBeShipped(): bool
    {
        return $this->status === OrderStatus::PROCESSING;
    }

    public function confirm(): bool
    {
        if (!$this->canBeConfirmed()) {
            return false;
        }

        $this->update(['status' => OrderStatus::CONFIRMED]);
        
        // Dispatch events
        event(new OrderConfirmed($this));
        
        return true;
    }

    public function cancel(): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->update(['status' => OrderStatus::CANCELLED]);
        
        // Dispatch events
        event(new OrderCancelled($this));
        
        return true;
    }

    public function ship(): bool
    {
        if (!$this->canBeShipped()) {
            return false;
        }

        $this->update([
            'status' => OrderStatus::SHIPPED,
            'shipped_at' => now()
        ]);
        
        // Dispatch events
        event(new OrderShipped($this));
        
        return true;
    }

    // Activity Log
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'total_amount'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
```

### Example 3: Repository Pattern Implementation
```php
<?php
// app/Contracts/UserRepositoryInterface.php - Repository contract
namespace App\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function find(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function create(array $data): User;
    public function update(User $user, array $data): User;
    public function delete(User $user): bool;
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function search(string $query): Collection;
    public function getActiveUsers(): Collection;
    public function getUsersByRole(string $role): Collection;
}

// app/Repositories/UserRepository.php - Repository implementation
<?php
namespace App\Repositories;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;

class UserRepository implements UserRepositoryInterface
{
    public function find(int $id): ?User
    {
        return User::with(['profile', 'roles'])->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return QueryBuilder::for(User::class)
            ->allowedFilters(['first_name', 'last_name', 'email', 'status'])
            ->allowedSorts(['first_name', 'last_name', 'email', 'created_at'])
            ->allowedIncludes(['profile', 'roles'])
            ->with(['profile', 'roles'])
            ->paginate($perPage);
    }

    public function search(string $query): Collection
    {
        return User::search($query)
            ->with(['profile', 'roles'])
            ->get();
    }

    public function getActiveUsers(): Collection
    {
        return User::active()
            ->with(['profile', 'roles'])
            ->get();
    }

    public function getUsersByRole(string $role): Collection
    {
        return User::byRole($role)
            ->with(['profile', 'roles'])
            ->get();
    }
}

// app/Providers/RepositoryServiceProvider.php - Repository binding
<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Contracts\OrderRepositoryInterface;
use App\Repositories\OrderRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
```

## Instructions

### PHP Application Architecture

Essential PHP components and configurations:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **Laravel/Symfony** | Critical | Framework foundation | Web applications |
| **Eloquent/Doctrine** | Critical | ORM, database | Data persistence |
| **Authentication** | Critical | Sanctum, JWT | Security |
| **Authorization** | High | Spatie Permissions | Access control |
| **Queue System** | High | Redis, Database | Background jobs |
| **Caching** | High | Redis, Memcached | Performance |
| **Testing** | High | PHPUnit, Pest | Quality assurance |
| **API Resources** | Medium | Fractal, JSON API | Serialization |

## Implementation Patterns

### 1. Service Layer Pattern
```php
<?php
// app/Services/UserService.php
namespace App\Services;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use App\Events\UserCreated;
use App\Events\UserUpdated;
use App\Exceptions\UserNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            // Hash password if provided
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            // Create user
            $user = $this->userRepository->create($data);

            // Assign default role
            $user->assignRole('user');

            // Create user profile
            $user->profile()->create([
                'bio' => '',
                'avatar' => null,
            ]);

            // Dispatch event
            event(new UserCreated($user));

            return $user;
        });
    }

    public function updateUser(int $userId, array $data): User
    {
        $user = $this->userRepository->find($userId);
        
        if (!$user) {
            throw new UserNotFoundException("User with ID {$userId} not found");
        }

        return DB::transaction(function () use ($user, $data) {
            // Hash password if provided
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            // Update user
            $updatedUser = $this->userRepository->update($user, $data);

            // Dispatch event
            event(new UserUpdated($updatedUser));

            return $updatedUser;
        });
    }

    public function deleteUser(int $userId): bool
    {
        $user = $this->userRepository->find($userId);
        
        if (!$user) {
            throw new UserNotFoundException("User with ID {$userId} not found");
        }

        return DB::transaction(function () use ($user) {
            // Soft delete related data
            $user->orders()->delete();
            $user->posts()->delete();
            
            // Delete user
            return $this->userRepository->delete($user);
        });
    }

    public function changePassword(int $userId, string $currentPassword, string $newPassword): bool
    {
        $user = $this->userRepository->find($userId);
        
        if (!$user) {
            throw new UserNotFoundException("User with ID {$userId} not found");
        }

        if (!Hash::check($currentPassword, $user->password)) {
            throw new InvalidPasswordException('Current password is incorrect');
        }

        return $this->userRepository->update($user, [
            'password' => Hash::make($newPassword)
        ]) !== null;
    }

    public function getUserStatistics(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::active()->count(),
            'new_users_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            'users_by_role' => User::join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                                  ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                                  ->groupBy('roles.name')
                                  ->selectRaw('roles.name, count(*) as count')
                                  ->pluck('count', 'name')
                                  ->toArray(),
        ];
    }
}
```

### 2. Event-Driven Architecture
```php
<?php
// app/Events/UserCreated.php
namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.users'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->full_name,
                'email' => $this->user->email,
                'created_at' => $this->user->created_at->toISOString(),
            ],
        ];
    }
}

// app/Listeners/SendWelcomeEmail.php
namespace App\Listeners;

use App\Events\UserCreated;
use App\Mail\WelcomeEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(UserCreated $event): void
    {
        Mail::to($event->user->email)->send(new WelcomeEmail($event->user));
    }

    public function failed(UserCreated $event, Throwable $exception): void
    {
        // Handle failed job
        logger()->error('Failed to send welcome email', [
            'user_id' => $event->user->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

// app/Providers/EventServiceProvider.php
namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\UserCreated;
use App\Listeners\SendWelcomeEmail;
use App\Listeners\CreateUserProfile;
use App\Listeners\LogUserActivity;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        UserCreated::class => [
            SendWelcomeEmail::class,
            CreateUserProfile::class,
            LogUserActivity::class,
        ],
        UserUpdated::class => [
            LogUserActivity::class,
        ],
        OrderConfirmed::class => [
            SendOrderConfirmationEmail::class,
            UpdateInventory::class,
            CreateInvoice::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
```

### 3. API Controllers with Resources
```php
<?php
// app/Http/Controllers/Api/V1/UserController.php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
use App\Services\UserService;
use App\Contracts\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService,
        private UserRepositoryInterface $userRepository
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view users')->only(['index', 'show']);
        $this->middleware('permission:create users')->only(['store']);
        $this->middleware('permission:update users')->only(['update']);
        $this->middleware('permission:delete users')->only(['destroy']);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $users = $this->userRepository->paginate(
            $request->only(['first_name', 'last_name', 'email', 'status']),
            $request->get('per_page', 15)
        );

        return UserResource::collection($users);
    }

    public function show(int $id): UserResource
    {
        $user = $this->userRepository->find($id);
        
        if (!$user) {
            abort(404, 'User not found');
        }

        return new UserResource($user);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, int $id): UserResource
    {
        $user = $this->userService->updateUser($id, $request->validated());

        return new UserResource($user);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->deleteUser($id);

        return response()->json(null, 204);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function statistics(): JsonResponse
    {
        $this->authorize('view statistics');
        
        $statistics = $this->userService->getUserStatistics();

        return response()->json($statistics);
    }
}

// app/Http/Resources/UserResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Conditional relationships
            'profile' => $this->whenLoaded('profile', function () {
                return new UserProfileResource($this->profile);
            }),
            
            'roles' => $this->whenLoaded('roles', function () {
                return RoleResource::collection($this->roles);
            }),
            
            'permissions' => $this->when($request->user()?->can('view permissions'), function () {
                return $this->getAllPermissions()->pluck('name');
            }),
        ];
    }
}

// app/Http/Requests/CreateUserRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use App\Enums\UserStatus;
use Illuminate\Validation\Rule;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create users');
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:50'],
            'last_name' => ['required', 'string', 'min:2', 'max:50'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'regex:/^[\+]?[1-9][\d]{0,15}$/'],
            'password' => ['required', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'status' => ['sometimes', Rule::enum(UserStatus::class)],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['exists:roles,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.unique' => 'This email address is already registered',
            'phone.regex' => 'Please enter a valid phone number',
            'password.required' => 'Password is required',
        ];
    }
}
```

### 4. Queue Jobs and Background Processing
```php
<?php
// app/Jobs/SendEmailJob.php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\GenericEmail;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $maxExceptions = 3;
    public $backoff = [60, 300, 900]; // 1 min, 5 min, 15 min

    public function __construct(
        private string $to,
        private string $subject,
        private string $template,
        private array $data = []
    ) {}

    public function handle(): void
    {
        Mail::to($this->to)->send(new GenericEmail(
            $this->subject,
            $this->template,
            $this->data
        ));
    }

    public function failed(Throwable $exception): void
    {
        logger()->error('Email job failed', [
            'to' => $this->to,
            'subject' => $this->subject,
            'error' => $exception->getMessage(),
        ]);
    }
}

// app/Jobs/ProcessOrderJob.php
namespace App\Jobs;

use App\Models\Order;
use App\Services\InventoryService;
use App\Services\PaymentService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public function __construct(
        private Order $order
    ) {}

    public function handle(
        InventoryService $inventoryService,
        PaymentService $paymentService,
        NotificationService $notificationService
    ): void {
        try {
            // Check inventory
            if (!$inventoryService->checkAvailability($this->order)) {
                $this->order->update(['status' => OrderStatus::CANCELLED]);
                $notificationService->sendOrderCancellationNotice($this->order);
                return;
            }

            // Process payment
            $paymentResult = $paymentService->processPayment($this->order);
            
            if (!$paymentResult->successful) {
                $this->order->update(['status' => OrderStatus::PAYMENT_FAILED]);
                $notificationService->sendPaymentFailureNotice($this->order);
                return;
            }

            // Update inventory
            $inventoryService->reserveItems($this->order);

            // Update order status
            $this->order->update([
                'status' => OrderStatus::PROCESSING,
                'payment_id' => $paymentResult->paymentId,
            ]);

            // Send confirmation
            $notificationService->sendOrderConfirmation($this->order);

        } catch (Exception $e) {
            logger()->error('Order processing failed', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
            ]);

            $this->fail($e);
        }
    }
}
```

### 5. Testing with PHPUnit
```php
<?php
// tests/Feature/UserControllerTest.php
namespace Tests\Feature;

use App\Models\User;
use App\Enums\UserStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_view_all_users(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $users = User::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                            'status',
                            'created_at',
                            'updated_at',
                        ]
                    ],
                    'links',
                    'meta'
                ]);
    }

    public function test_regular_user_cannot_view_all_users(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $userData = [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'Password123!',
            'status' => UserStatus::ACTIVE->value,
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'status',
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
        ]);
    }

    public function test_user_creation_validates_required_fields(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/users', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'first_name',
                    'last_name',
                    'email',
                    'password'
                ]);
    }

    public function test_user_can_view_own_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/users/{$user->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'data' => [
                        'id' => $user->id,
                        'email' => $user->email,
                    ]
                ]);
    }

    public function test_user_cannot_view_other_users_profile(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/users/{$otherUser->id}");

        $response->assertStatus(403);
    }
}

// tests/Unit/UserServiceTest.php
namespace Tests\Unit;

use App\Services\UserService;
use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use App\Events\UserCreated;
use App\Exceptions\UserNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Mockery;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $userService;
    private $userRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = Mockery::mock(UserRepositoryInterface::class);
        $this->userService = new UserService($this->userRepository);
    }

    public function test_create_user_successfully(): void
    {
        Event::fake();

        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $user = User::factory()->make($userData);
        $user->id = 1;

        $this->userRepository
            ->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($data) use ($userData) {
                return $data['first_name'] === $userData['first_name'] &&
                       $data['last_name'] === $userData['last_name'] &&
                       $data['email'] === $userData['email'] &&
                       Hash::check($userData['password'], $data['password']);
            }))
            ->andReturn($user);

        $result = $this->userService->createUser($userData);

        $this->assertEquals($user->id, $result->id);
        $this->assertEquals($userData['email'], $result->email);
        
        Event::assertDispatched(UserCreated::class, function ($event) use ($user) {
            return $event->user->id === $user->id;
        });
    }

    public function test_update_user_throws_exception_when_user_not_found(): void
    {
        $this->userRepository
            ->shouldReceive('find')
            ->with(999)
            ->andReturn(null);

        $this->expectException(UserNotFoundException::class);
        $this->expectExceptionMessage('User with ID 999 not found');

        $this->userService->updateUser(999, ['first_name' => 'Updated']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
```

## Expected Output

This template will produce:

- **Complete PHP Application**: Production-ready Laravel/Symfony application with modern PHP 8.2+ features
- **Eloquent ORM Integration**: Comprehensive models with relationships, scopes, and advanced features
- **Repository Pattern**: Clean data access layer with contracts and dependency injection
- **Service Layer**: Business logic separation with transaction management and event handling
- **RESTful API Architecture**: Comprehensive API controllers with resources and validation
- **Event-Driven System**: Event and listener architecture for decoupled application logic
- **Queue System**: Background job processing with retry logic and error handling
- **Comprehensive Testing**: PHPUnit test suite with feature and unit tests
- **Authentication & Authorization**: Sanctum authentication with role-based permissions
- **Performance Optimization**: Caching strategies, query optimization, and database indexing

## Integration Points

- Connects with containerization modules for Docker deployment
- Integrates with Kubernetes modules for container orchestration
- Works with CI/CD modules for automated deployment pipelines
- Supports cloud platform modules for AWS, GCP, and Azure deployment
- Compatible with monitoring modules for application observability

## Security Considerations

- Laravel Sanctum authentication with secure token management
- Spatie Permissions for role-based access control and authorization
- Password hashing with bcrypt and validation rules
- CSRF protection and secure headers configuration
- SQL injection prevention through Eloquent ORM parameterized queries
- XSS protection with Laravel's built-in sanitization

## Performance Features

- Database connection pooling and query optimization with Eloquent
- Redis caching for session storage and application caching
- Queue system with Redis/Database for background job processing
- Database indexing strategies for optimal query performance
- Lazy loading and eager loading for N+1 query prevention
- Response caching and API rate limiting

## Enterprise Features

- Comprehensive error handling and logging with structured output
- Activity logging for audit trails and compliance tracking
- Multi-environment configuration with Laravel configuration system
- Database migrations with rollback capabilities
- API versioning and backward compatibility support
- Health check endpoints for monitoring and load balancer integration

This template provides a solid foundation for building modern PHP applications with enterprise-grade features, comprehensive testing, and production-ready deployment configurations using Laravel and Symfony frameworks.
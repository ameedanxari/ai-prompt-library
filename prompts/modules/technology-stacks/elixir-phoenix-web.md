# Elixir/Phoenix Web Applications Template

## Purpose

This template provides comprehensive patterns for building fault-tolerant web applications using Elixir and Phoenix Framework, including OTP (Open Telecom Platform) principles, GenServers, Supervisors, LiveView real-time features, and distributed systems. It covers enterprise-scale Elixir development with advanced concurrency patterns, fault tolerance, and high-availability systems.

## Context

Elixir is a dynamic, functional language designed for building maintainable and scalable applications, running on the Erlang Virtual Machine (BEAM). This template addresses modern Elixir development including Phoenix web framework, LiveView for real-time UIs, OTP for fault-tolerant systems, Ecto for database interactions, and distributed computing with comprehensive testing and deployment strategies.

## Examples

### Example 1: Phoenix Web Application with LiveView
```elixir
# mix.exs
defmodule MyApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :my_app,
      version: "0.1.0",
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {MyApp.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp deps do
    [
      {:phoenix, "~> 1.7.10"},
      {:phoenix_ecto, "~> 4.4"},
      {:ecto_sql, "~> 3.10"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_live_view, "~> 0.20.2"},
      {:phoenix_live_dashboard, "~> 0.8.2"},
      {:jason, "~> 1.2"},
      {:plug_cowboy, "~> 2.5"},
      {:bcrypt_elixir, "~> 3.0"},
      {:oban, "~> 2.15"}
    ]
  end
end

# lib/my_app/accounts/user.ex
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "users" do
    field :name, :string
    field :email, :string
    field :hashed_password, :string, redact: true
    field :role, Ecto.Enum, values: [:user, :admin], default: :user

    timestamps(type: :utc_datetime)
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :role])
    |> validate_required([:name, :email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/)
    |> unique_constraint(:email)
  end
end

# lib/my_app_web/live/user_live/index.ex
defmodule MyAppWeb.UserLive.Index do
  use MyAppWeb, :live_view

  alias MyApp.Accounts
  alias MyApp.Accounts.User

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket), do: Accounts.subscribe()
    
    {:ok, stream(socket, :users, Accounts.list_users())}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :edit, %{"id" => id}) do
    socket
    |> assign(:page_title, "Edit User")
    |> assign(:user, Accounts.get_user!(id))
  end

  defp apply_action(socket, :new, _params) do
    socket
    |> assign(:page_title, "New User")
    |> assign(:user, %User{})
  end

  defp apply_action(socket, :index, _params) do
    socket
    |> assign(:page_title, "Listing Users")
    |> assign(:user, nil)
  end

  @impl true
  def handle_info({MyAppWeb.UserLive.FormComponent, {:saved, user}}, socket) do
    {:noreply, stream_insert(socket, :users, user)}
  end

  @impl true
  def handle_info({:user_created, user}, socket) do
    {:noreply, stream_insert(socket, :users, user)}
  end

  @impl true
  def handle_info({:user_updated, user}, socket) do
    {:noreply, stream_insert(socket, :users, user)}
  end

  @impl true
  def handle_info({:user_deleted, user}, socket) do
    {:noreply, stream_delete(socket, :users, user)}
  end

  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    user = Accounts.get_user!(id)
    {:ok, _} = Accounts.delete_user(user)

    {:noreply, stream_delete(socket, :users, user)}
  end
end
```

### Example 2: GenServer for State Management
```elixir
# lib/my_app/user_cache.ex
defmodule MyApp.UserCache do
  use GenServer
  require Logger

  @name __MODULE__

  # Client API
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: @name)
  end

  def get_user(user_id) do
    GenServer.call(@name, {:get_user, user_id})
  end

  def put_user(user) do
    GenServer.cast(@name, {:put_user, user})
  end

  def delete_user(user_id) do
    GenServer.cast(@name, {:delete_user, user_id})
  end

  def clear_cache do
    GenServer.cast(@name, :clear_cache)
  end

  # Server Callbacks
  @impl true
  def init(_opts) do
    Logger.info("Starting UserCache")
    {:ok, %{}}
  end

  @impl true
  def handle_call({:get_user, user_id}, _from, state) do
    case Map.get(state, user_id) do
      nil ->
        # Cache miss - fetch from database
        case MyApp.Accounts.get_user(user_id) do
          nil ->
            {:reply, {:error, :not_found}, state}
          user ->
            new_state = Map.put(state, user_id, user)
            {:reply, {:ok, user}, new_state}
        end
      user ->
        # Cache hit
        {:reply, {:ok, user}, state}
    end
  end

  @impl true
  def handle_cast({:put_user, user}, state) do
    new_state = Map.put(state, user.id, user)
    {:noreply, new_state}
  end

  @impl true
  def handle_cast({:delete_user, user_id}, state) do
    new_state = Map.delete(state, user_id)
    {:noreply, new_state}
  end

  @impl true
  def handle_cast(:clear_cache, _state) do
    Logger.info("Clearing user cache")
    {:noreply, %{}}
  end

  @impl true
  def handle_info(:cleanup, state) do
    # Periodic cleanup of old entries
    Logger.info("Running cache cleanup")
    schedule_cleanup()
    {:noreply, state}
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, :timer.hours(1))
  end
end

# lib/my_app/user_manager.ex
defmodule MyApp.UserManager do
  use GenServer
  require Logger

  @name __MODULE__

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: @name)
  end

  def user_created(user) do
    GenServer.cast(@name, {:user_created, user})
  end

  def user_updated(user) do
    GenServer.cast(@name, {:user_updated, user})
  end

  def user_deleted(user) do
    GenServer.cast(@name, {:user_deleted, user})
  end

  @impl true
  def init(_opts) do
    Logger.info("Starting UserManager")
    {:ok, %{}}
  end

  @impl true
  def handle_cast({:user_created, user}, state) do
    Logger.info("User created: #{user.email}")
    
    # Update cache
    MyApp.UserCache.put_user(user)
    
    # Broadcast to LiveView
    Phoenix.PubSub.broadcast(MyApp.PubSub, "users", {:user_created, user})
    
    # Schedule welcome email
    %{user_id: user.id, email: user.email}
    |> MyApp.Workers.WelcomeEmailWorker.new()
    |> Oban.insert()
    
    {:noreply, state}
  end

  @impl true
  def handle_cast({:user_updated, user}, state) do
    Logger.info("User updated: #{user.email}")
    
    MyApp.UserCache.put_user(user)
    Phoenix.PubSub.broadcast(MyApp.PubSub, "users", {:user_updated, user})
    
    {:noreply, state}
  end

  @impl true
  def handle_cast({:user_deleted, user}, state) do
    Logger.info("User deleted: #{user.email}")
    
    MyApp.UserCache.delete_user(user.id)
    Phoenix.PubSub.broadcast(MyApp.PubSub, "users", {:user_deleted, user})
    
    {:noreply, state}
  end
end
```

### Example 3: Background Jobs with Oban
```elixir
# lib/my_app/workers/welcome_email_worker.ex
defmodule MyApp.Workers.WelcomeEmailWorker do
  use Oban.Worker, queue: :emails, max_attempts: 3

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"user_id" => user_id, "email" => email}}) do
    case send_welcome_email(email) do
      :ok ->
        :ok
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp send_welcome_email(email) do
    # Simulate email sending
    Process.sleep(1000)
    
    if String.contains?(email, "invalid") do
      {:error, "Invalid email address"}
    else
      :ok
    end
  end
end

# lib/my_app/workers/data_processor_worker.ex
defmodule MyApp.Workers.DataProcessorWorker do
  use Oban.Worker, queue: :data_processing, max_attempts: 5

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"data" => data, "operation" => operation}}) do
    case operation do
      "transform" -> transform_data(data)
      "validate" -> validate_data(data)
      "export" -> export_data(data)
      _ -> {:error, "Unknown operation"}
    end
  end

  defp transform_data(data) do
    # Heavy data transformation
    transformed = 
      data
      |> Enum.map(&String.upcase/1)
      |> Enum.filter(&(String.length(&1) > 3))
    
    {:ok, transformed}
  end

  defp validate_data(data) do
    valid = Enum.all?(data, &is_binary/1)
    if valid, do: :ok, else: {:error, "Invalid data format"}
  end

  defp export_data(data) do
    # Export to external system
    :ok
  end
end
```

## Instructions

### 1. Set Up Elixir Development Environment

```bash
# Install Elixir using asdf (recommended)
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.13.1
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
echo '. "$HOME/.asdf/completions/asdf.bash"' >> ~/.bashrc
source ~/.bashrc

asdf plugin add erlang
asdf plugin add elixir
asdf install erlang 26.1.2
asdf install elixir 1.15.7-otp-26
asdf global erlang 26.1.2
asdf global elixir 1.15.7-otp-26

# Or using Homebrew on macOS
brew install elixir

# Install Phoenix
mix archive.install hex phx_new
```

### 2. Create New Phoenix Project

```bash
# Create new Phoenix project
mix phx.new my_app --live
cd my_app

# Set up database
mix ecto.create
mix ecto.migrate

# Install dependencies
mix deps.get

# Install Node.js dependencies
cd assets && npm install && cd ..

# Start Phoenix server
mix phx.server
```

### 3. Implement OTP Patterns

```elixir
# lib/my_app/user_supervisor.ex
defmodule MyApp.UserSupervisor do
  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      {MyApp.UserCache, []},
      {MyApp.UserManager, []},
      {DynamicSupervisor, name: MyApp.UserSessionSupervisor, strategy: :one_for_one}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end

# lib/my_app/user_session.ex
defmodule MyApp.UserSession do
  use GenServer

  def start_link(user_id) do
    GenServer.start_link(__MODULE__, user_id, name: via_tuple(user_id))
  end

  def get_session(user_id) do
    case GenServer.whereis(via_tuple(user_id)) do
      nil ->
        DynamicSupervisor.start_child(
          MyApp.UserSessionSupervisor,
          {__MODULE__, user_id}
        )
      pid ->
        {:ok, pid}
    end
  end

  defp via_tuple(user_id) do
    {:via, Registry, {MyApp.UserSessionRegistry, user_id}}
  end

  @impl true
  def init(user_id) do
    {:ok, %{user_id: user_id, last_activity: DateTime.utc_now()}}
  end
end
```

### 4. Implement Real-time Features with LiveView

```elixir
# lib/my_app_web/live/dashboard_live.ex
defmodule MyAppWeb.DashboardLive do
  use MyAppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(MyApp.PubSub, "dashboard")
      :timer.send_interval(1000, self(), :update_metrics)
    end

    {:ok, assign(socket, :metrics, get_initial_metrics())}
  end

  @impl true
  def handle_info(:update_metrics, socket) do
    metrics = get_current_metrics()
    {:noreply, assign(socket, :metrics, metrics)}
  end

  @impl true
  def handle_info({:metric_updated, metric}, socket) do
    updated_metrics = Map.put(socket.assigns.metrics, metric.name, metric.value)
    {:noreply, assign(socket, :metrics, updated_metrics)}
  end

  defp get_initial_metrics do
    %{
      active_users: 0,
      total_requests: 0,
      response_time: 0.0
    }
  end

  defp get_current_metrics do
    %{
      active_users: MyApp.Metrics.active_users(),
      total_requests: MyApp.Metrics.total_requests(),
      response_time: MyApp.Metrics.avg_response_time()
    }
  end
end
```

## Implementation Patterns

### Pattern Matching and Guards

```elixir
defmodule MyApp.UserValidator do
  def validate_user(%{email: email, age: age} = user) 
      when is_binary(email) and is_integer(age) and age >= 18 do
    case validate_email_format(email) do
      :ok -> {:ok, user}
      error -> error
    end
  end

  def validate_user(%{email: email}) when not is_binary(email) do
    {:error, "Email must be a string"}
  end

  def validate_user(%{age: age}) when age < 18 do
    {:error, "User must be at least 18 years old"}
  end

  def validate_user(_user) do
    {:error, "Invalid user data"}
  end

  defp validate_email_format(email) do
    if String.contains?(email, "@") do
      :ok
    else
      {:error, "Invalid email format"}
    end
  end
end
```

### Error Handling with "Let it Crash" Philosophy

```elixir
defmodule MyApp.ResilientWorker do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts)
  end

  def process_data(pid, data) do
    GenServer.call(pid, {:process, data})
  end

  @impl true
  def init(_opts) do
    {:ok, %{processed_count: 0}}
  end

  @impl true
  def handle_call({:process, data}, _from, state) do
    # Let it crash if data is invalid - supervisor will restart
    result = dangerous_operation(data)
    new_state = %{state | processed_count: state.processed_count + 1}
    {:reply, result, new_state}
  end

  defp dangerous_operation(data) when is_list(data) do
    # This will crash if data contains non-integers
    Enum.sum(data)
  end

  defp dangerous_operation(_data) do
    raise "Invalid data type"
  end
end
```

## Expected Output

### Fault-Tolerant System Benefits
- Self-healing applications with supervisor trees
- Isolated process failures don't affect the entire system
- Hot code swapping for zero-downtime deployments
- Massive concurrency with lightweight processes
- Built-in distribution across multiple nodes

### Real-time Capabilities
- WebSocket connections with Phoenix Channels
- Live updates without page refreshes using LiveView
- Real-time collaboration features
- Server-sent events for live data streaming
- Presence tracking for user activity

### Performance Characteristics
- Millions of concurrent connections
- Low-latency message passing between processes
- Efficient memory usage with process isolation
- Automatic garbage collection per process
- Horizontal scaling across multiple machines

## Integration Points

Elixir integrates with PostgreSQL and other databases through Ecto, providing type-safe queries and migrations. Phoenix channels enable real-time WebSocket connections, while Oban handles background job processing. The language seamlessly integrates with Erlang libraries, accessing decades of battle-tested code for telecommunications and distributed systems. Integration with external APIs through HTTPoison or Tesla, message queues like RabbitMQ, and caching systems like Redis is straightforward. Elixir's distribution capabilities enable easy clustering and inter-node communication.

```elixir
# Example integration patterns
# Ecto database connection
config :my_app, MyApp.Repo,
  database: "my_app_db",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"

# Phoenix channel
channel "room:*", MyAppWeb.RoomChannel

# Oban background jobs
Oban.insert(MyWorker.new(%{id: 123}))

# HTTPoison API client
HTTPoison.get("https://api.example.com/data")
```

### Database Integration with Ecto
```elixir
# lib/my_app/analytics.ex
defmodule MyApp.Analytics do
  import Ecto.Query

  def user_stats_by_month do
    from u in User,
      group_by: fragment("date_trunc('month', ?)", u.inserted_at),
      select: %{
        month: fragment("date_trunc('month', ?)", u.inserted_at),
        count: count(u.id),
        avg_age: avg(u.age)
      },
      order_by: [desc: fragment("date_trunc('month', ?)", u.inserted_at)]
  end

  def active_users_last_week do
    week_ago = DateTime.utc_now() |> DateTime.add(-7, :day)
    
    from u in User,
      where: u.last_login_at > ^week_ago,
      select: count(u.id)
  end
end
```

### External API Integration
```elixir
# lib/my_app/external_api.ex
defmodule MyApp.ExternalAPI do
  use Tesla

  plug Tesla.Middleware.BaseUrl, "https://api.example.com"
  plug Tesla.Middleware.JSON
  plug Tesla.Middleware.Retry, delay: 500, max_retries: 3

  def get_user_data(user_id) do
    case get("/users/#{user_id}") do
      {:ok, %{status: 200, body: body}} ->
        {:ok, body}
      {:ok, %{status: 404}} ->
        {:error, :not_found}
      {:error, reason} ->
        {:error, reason}
    end
  end

  def create_user(user_data) do
    case post("/users", user_data) do
      {:ok, %{status: 201, body: body}} ->
        {:ok, body}
      {:ok, %{status: status, body: body}} ->
        {:error, {status, body}}
      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

## Security Considerations

Phoenix provides built-in protection against common web vulnerabilities including CSRF, XSS, and SQL injection through parameterized queries. Guardian enables JWT-based authentication, while Comeonin/Argon2 provide secure password hashing. Security best practices include input validation with Ecto changesets, rate limiting to prevent abuse, secure session management, and proper error handling to avoid information leakage. The BEAM VM's process isolation provides additional security by containing failures and preventing cascade effects.

### Authentication with Guardian
```elixir
# lib/my_app/guardian.ex
defmodule MyApp.Guardian do
  use Guardian, otp_app: :my_app

  def subject_for_token(%{id: id}, _claims) do
    {:ok, to_string(id)}
  end

  def resource_from_claims(%{"sub" => id}) do
    case MyApp.Accounts.get_user(id) do
      nil -> {:error, :resource_not_found}
      user -> {:ok, user}
    end
  end
end

# lib/my_app_web/plugs/auth_plug.ex
defmodule MyAppWeb.AuthPlug do
  import Plug.Conn
  import Phoenix.Controller

  def init(opts), do: opts

  def call(conn, _opts) do
    case Guardian.Plug.current_resource(conn) do
      nil ->
        conn
        |> put_flash(:error, "You must be logged in")
        |> redirect(to: "/login")
        |> halt()
      _user ->
        conn
    end
  end
end
```

### Input Validation and Sanitization
```elixir
# lib/my_app/input_validator.ex
defmodule MyApp.InputValidator do
  @email_regex ~r/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  def validate_and_sanitize(params) do
    params
    |> validate_required_fields()
    |> sanitize_strings()
    |> validate_formats()
  end

  defp validate_required_fields(params) do
    required = [:name, :email]
    missing = required -- Map.keys(params)
    
    if Enum.empty?(missing) do
      {:ok, params}
    else
      {:error, "Missing required fields: #{Enum.join(missing, ", ")}"}
    end
  end

  defp sanitize_strings({:ok, params}) do
    sanitized = 
      params
      |> Enum.map(fn {k, v} when is_binary(v) -> {k, String.trim(v)} end)
      |> Enum.into(%{})
    
    {:ok, sanitized}
  end

  defp sanitize_strings(error), do: error

  defp validate_formats({:ok, %{email: email} = params}) do
    if Regex.match?(@email_regex, email) do
      {:ok, params}
    else
      {:error, "Invalid email format"}
    end
  end

  defp validate_formats(error), do: error
end
```

## Performance Features

Elixir achieves exceptional performance through the BEAM VM's lightweight processes, enabling millions of concurrent connections with low latency. The language's immutable data structures and functional programming model facilitate efficient garbage collection per process. Performance optimization includes ETS tables for in-memory caching, GenStage for backpressure-aware data processing, and distributed computing across multiple nodes. Phoenix LiveView eliminates the need for separate frontend frameworks while maintaining real-time responsiveness, and the "let it crash" philosophy ensures system resilience without performance degradation.

### Caching Strategies
```elixir
# lib/my_app/cache.ex
defmodule MyApp.Cache do
  use GenServer

  @ttl :timer.minutes(30)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def get(key) do
    GenServer.call(__MODULE__, {:get, key})
  end

  def put(key, value, ttl \\ @ttl) do
    GenServer.cast(__MODULE__, {:put, key, value, ttl})
  end

  @impl true
  def init(_opts) do
    :timer.send_interval(:timer.minutes(5), :cleanup)
    {:ok, %{}}
  end

  @impl true
  def handle_call({:get, key}, _from, state) do
    case Map.get(state, key) do
      {value, expires_at} ->
        if DateTime.compare(DateTime.utc_now(), expires_at) == :lt do
          {:reply, {:ok, value}, state}
        else
          new_state = Map.delete(state, key)
          {:reply, :not_found, new_state}
        end
      nil ->
        {:reply, :not_found, state}
    end
  end

  @impl true
  def handle_cast({:put, key, value, ttl}, state) do
    expires_at = DateTime.add(DateTime.utc_now(), ttl, :millisecond)
    new_state = Map.put(state, key, {value, expires_at})
    {:noreply, new_state}
  end

  @impl true
  def handle_info(:cleanup, state) do
    now = DateTime.utc_now()
    
    cleaned_state = 
      state
      |> Enum.reject(fn {_key, {_value, expires_at}} ->
        DateTime.compare(now, expires_at) != :lt
      end)
      |> Enum.into(%{})
    
    {:noreply, cleaned_state}
  end
end
```

### Distributed Computing
```elixir
# lib/my_app/distributed_cache.ex
defmodule MyApp.DistributedCache do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def get(key) do
    # Try local cache first
    case :ets.lookup(:local_cache, key) do
      [{^key, value}] -> {:ok, value}
      [] -> get_from_cluster(key)
    end
  end

  def put(key, value) do
    # Store locally and broadcast to cluster
    :ets.insert(:local_cache, {key, value})
    :rpc.multicall(Node.list(), __MODULE__, :put_local, [key, value])
    :ok
  end

  def put_local(key, value) do
    :ets.insert(:local_cache, {key, value})
  end

  defp get_from_cluster(key) do
    nodes = Node.list()
    
    case :rpc.multicall(nodes, :ets, :lookup, [:local_cache, key]) do
      {results, []} ->
        case Enum.find(results, fn result -> result != [] end) do
          [{^key, value}] -> {:ok, value}
          nil -> :not_found
        end
      _ ->
        :not_found
    end
  end

  @impl true
  def init(_opts) do
    :ets.new(:local_cache, [:named_table, :public, :set])
    {:ok, %{}}
  end
end
```

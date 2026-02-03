# Ruby on Rails Technology Stack Template

## Purpose

This template provides comprehensive patterns for implementing modern Ruby on Rails applications with RESTful APIs, background jobs, real-time features, and production-ready deployment configurations. It covers Rails 7+ with Hotwire, Action Cable, Active Job, and comprehensive testing strategies for building scalable, maintainable web applications.

## Context

Ruby on Rails continues to be a powerful framework for rapid web development with convention over configuration principles. This template covers Rails 7+ with modern features including Hotwire (Turbo + Stimulus), Action Cable for real-time features, background job processing, and comprehensive testing with RSpec for building production-ready applications.

## Examples

### Example 1: Complete Rails Application Setup
```ruby
# Gemfile - Modern Rails dependencies
source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.2.0'

# Core Rails gems
gem 'rails', '~> 7.1.0'
gem 'pg', '~> 1.1'
gem 'puma', '~> 6.0'
gem 'redis', '~> 5.0'
gem 'bootsnap', '>= 1.4.4', require: false

# Frontend and Assets
gem 'sassc-rails'
gem 'image_processing', '~> 1.2'
gem 'turbo-rails'
gem 'stimulus-rails'
gem 'jbuilder', '~> 2.7'

# Authentication and Authorization
gem 'devise'
gem 'omniauth'
gem 'omniauth-rails_csrf_protection'
gem 'pundit'

# Background Jobs
gem 'sidekiq'
gem 'sidekiq-web'

# API and Serialization
gem 'jsonapi-serializer'
gem 'rack-cors'

# Monitoring and Performance
gem 'newrelic_rpm'
gem 'scout_apm'
gem 'lograge'

# Development and Testing
group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'pry-rails'
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
end

group :development do
  gem 'web-console', '>= 4.1.0'
  gem 'listen', '~> 3.3'
  gem 'spring'
  gem 'annotate'
  gem 'bullet'
end

group :test do
  gem 'capybara', '>= 3.26'
  gem 'selenium-webdriver'
  gem 'webdrivers'
  gem 'shoulda-matchers'
  gem 'database_cleaner-active_record'
  gem 'vcr'
  gem 'webmock'
end

# config/application.rb - Application configuration
require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module MyApplication
  class Application < Rails::Application
    config.load_defaults 7.1
    
    # Configuration for the application
    config.time_zone = 'UTC'
    
    # CORS configuration
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins Rails.env.development? ? 'localhost:3000' : ENV['FRONTEND_URL']
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: true
      end
    end
    
    # Background job configuration
    config.active_job.queue_adapter = :sidekiq
    
    # Generator configuration
    config.generators do |g|
      g.test_framework :rspec
      g.factory_bot true
      g.view_specs false
      g.helper_specs false
      g.routing_specs false
    end
    
    # API configuration
    config.api_only_middleware = false
    
    # Security configuration
    config.force_ssl = Rails.env.production?
    config.ssl_options = { redirect: { exclude: ->(request) { request.path =~ /health/ } } }
  end
end
```

### Example 2: Active Record Models with Associations
```ruby
# app/models/user.rb - User model with comprehensive features
class User < ApplicationRecord
  # Devise modules for authentication
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :lockable, :trackable

  # Enums
  enum status: { active: 0, inactive: 1, suspended: 2, pending_verification: 3 }
  enum role: { user: 0, admin: 1, moderator: 2 }

  # Associations
  has_many :orders, dependent: :destroy
  has_many :posts, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_one :profile, dependent: :destroy
  has_one_attached :avatar
  has_many_attached :documents

  # Validations
  validates :first_name, :last_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :phone, format: { with: /\A[\+]?[1-9][\d]{0,15}\z/, message: "Invalid phone format" }, allow_blank: true

  # Callbacks
  before_create :set_default_role
  after_create :create_user_profile
  after_update :log_status_change, if: :saved_change_to_status?

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :by_role, ->(role) { where(role: role) }
  scope :recent, -> { order(created_at: :desc) }
  scope :search, ->(query) { where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", "%#{query}%", "%#{query}%", "%#{query}%") }

  # Instance methods
  def full_name
    "#{first_name} #{last_name}".strip
  end

  def display_name
    full_name.present? ? full_name : email
  end

  def admin?
    role == 'admin'
  end

  def can_moderate?
    admin? || moderator?
  end

  def active_for_authentication?
    super && active?
  end

  def inactive_message
    active? ? super : :account_inactive
  end

  # Class methods
  def self.find_for_authentication(warden_conditions)
    where(email: warden_conditions[:email]).first
  end

  private

  def set_default_role
    self.role ||= :user
  end

  def create_user_profile
    Profile.create!(user: self)
  end

  def log_status_change
    Rails.logger.info "User #{id} status changed from #{status_before_last_save} to #{status}"
  end
end

# app/models/order.rb - Order model with state machine
class Order < ApplicationRecord
  include AASM

  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  validates :total_amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true

  # State machine using AASM
  aasm column: :status do
    state :pending, initial: true
    state :confirmed
    state :processing
    state :shipped
    state :delivered
    state :cancelled
    state :refunded

    event :confirm do
      transitions from: :pending, to: :confirmed
      after do
        OrderConfirmationJob.perform_later(self)
      end
    end

    event :process do
      transitions from: :confirmed, to: :processing
      after do
        InventoryUpdateJob.perform_later(self)
      end
    end

    event :ship do
      transitions from: :processing, to: :shipped
      after do
        ShippingNotificationJob.perform_later(self)
      end
    end

    event :deliver do
      transitions from: :shipped, to: :delivered
      after do
        DeliveryConfirmationJob.perform_later(self)
      end
    end

    event :cancel do
      transitions from: [:pending, :confirmed, :processing], to: :cancelled
      after do
        CancellationJob.perform_later(self)
      end
    end

    event :refund do
      transitions from: [:delivered, :cancelled], to: :refunded
      after do
        RefundProcessingJob.perform_later(self)
      end
    end
  end

  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_user, ->(user) { where(user: user) }

  def calculate_total
    order_items.sum { |item| item.quantity * item.unit_price }
  end

  def can_be_cancelled?
    pending? || confirmed? || processing?
  end

  def can_be_refunded?
    delivered? || cancelled?
  end
end

# app/models/concerns/searchable.rb - Searchable concern
module Searchable
  extend ActiveSupport::Concern

  included do
    include PgSearch::Model
    
    pg_search_scope :search_by_all_fields,
      against: search_fields,
      using: {
        tsearch: { prefix: true },
        trigram: { threshold: 0.3 }
      }
  end

  class_methods do
    def search_fields
      []
    end

    def search(query)
      return all if query.blank?
      search_by_all_fields(query)
    end
  end
end
```

### Example 3: Controllers with Strong Parameters
```ruby
# app/controllers/application_controller.rb - Base controller
class ApplicationController < ActionController::Base
  include Pundit::Authorization
  
  protect_from_forgery with: :exception
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActionController::ParameterMissing, with: :parameter_missing

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name, :phone])
    devise_parameter_sanitizer.permit(:account_update, keys: [:first_name, :last_name, :phone])
  end

  def user_not_authorized
    flash[:alert] = "You are not authorized to perform this action."
    redirect_back(fallback_location: root_path)
  end

  def record_not_found
    render json: { error: 'Record not found' }, status: :not_found
  end

  def parameter_missing(exception)
    render json: { error: "Missing parameter: #{exception.param}" }, status: :bad_request
  end
end

# app/controllers/api/v1/base_controller.rb - API base controller
class Api::V1::BaseController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_api_user!
  
  respond_to :json

  private

  def authenticate_api_user!
    token = request.headers['Authorization']&.split(' ')&.last
    return render_unauthorized unless token

    begin
      decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
      user_id = decoded_token[0]['user_id']
      @current_user = User.find(user_id)
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render_unauthorized
    end
  end

  def render_unauthorized
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  def render_validation_errors(resource)
    render json: {
      errors: resource.errors.full_messages
    }, status: :unprocessable_entity
  end

  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      next_page: collection.next_page,
      prev_page: collection.prev_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count
    }
  end
end

# app/controllers/api/v1/users_controller.rb - Users API controller
class Api::V1::UsersController < Api::V1::BaseController
  before_action :set_user, only: [:show, :update, :destroy]
  before_action :authorize_user, only: [:update, :destroy]

  # GET /api/v1/users
  def index
    authorize User
    
    @users = User.includes(:profile)
                 .search(params[:search])
                 .by_role(params[:role]) if params[:role].present?
                 .page(params[:page])
                 .per(params[:per_page] || 20)

    render json: {
      users: UserSerializer.new(@users).serializable_hash[:data],
      meta: pagination_meta(@users)
    }
  end

  # GET /api/v1/users/:id
  def show
    authorize @user
    render json: UserSerializer.new(@user).serializable_hash
  end

  # POST /api/v1/users
  def create
    authorize User
    
    @user = User.new(user_params)

    if @user.save
      render json: UserSerializer.new(@user).serializable_hash, status: :created
    else
      render_validation_errors(@user)
    end
  end

  # PATCH/PUT /api/v1/users/:id
  def update
    if @user.update(user_params)
      render json: UserSerializer.new(@user).serializable_hash
    else
      render_validation_errors(@user)
    end
  end

  # DELETE /api/v1/users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  # GET /api/v1/users/me
  def me
    render json: UserSerializer.new(@current_user).serializable_hash
  end

  # PATCH /api/v1/users/me
  def update_me
    if @current_user.update(user_params)
      render json: UserSerializer.new(@current_user).serializable_hash
    else
      render_validation_errors(@current_user)
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def authorize_user
    authorize @user
  end

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :phone, :status, :role)
  end
end

# app/controllers/orders_controller.rb - Orders controller with Hotwire
class OrdersController < ApplicationController
  before_action :set_order, only: [:show, :edit, :update, :destroy, :confirm, :cancel]
  before_action :authorize_order, only: [:show, :edit, :update, :destroy, :confirm, :cancel]

  # GET /orders
  def index
    @orders = policy_scope(Order)
                .includes(:user, :order_items, :products)
                .by_status(params[:status]) if params[:status].present?
                .recent
                .page(params[:page])

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  # GET /orders/:id
  def show
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  # GET /orders/new
  def new
    @order = current_user.orders.build
    authorize @order
  end

  # POST /orders
  def create
    @order = current_user.orders.build(order_params)
    authorize @order

    respond_to do |format|
      if @order.save
        format.html { redirect_to @order, notice: 'Order was successfully created.' }
        format.turbo_stream { flash.now[:notice] = 'Order was successfully created.' }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream { render :new, status: :unprocessable_entity }
      end
    end
  end

  # PATCH /orders/:id/confirm
  def confirm
    if @order.may_confirm?
      @order.confirm!
      respond_to do |format|
        format.html { redirect_to @order, notice: 'Order confirmed successfully.' }
        format.turbo_stream { flash.now[:notice] = 'Order confirmed successfully.' }
      end
    else
      respond_to do |format|
        format.html { redirect_to @order, alert: 'Cannot confirm this order.' }
        format.turbo_stream { flash.now[:alert] = 'Cannot confirm this order.' }
      end
    end
  end

  # PATCH /orders/:id/cancel
  def cancel
    if @order.may_cancel?
      @order.cancel!
      respond_to do |format|
        format.html { redirect_to @order, notice: 'Order cancelled successfully.' }
        format.turbo_stream { flash.now[:notice] = 'Order cancelled successfully.' }
      end
    else
      respond_to do |format|
        format.html { redirect_to @order, alert: 'Cannot cancel this order.' }
        format.turbo_stream { flash.now[:alert] = 'Cannot cancel this order.' }
      end
    end
  end

  private

  def set_order
    @order = Order.find(params[:id])
  end

  def authorize_order
    authorize @order
  end

  def order_params
    params.require(:order).permit(:total_amount, order_items_attributes: [:id, :product_id, :quantity, :unit_price, :_destroy])
  end
end
```

## Instructions

### Rails Application Architecture

Essential Rails components and configurations:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **Active Record** | Critical | Models, migrations | Data persistence |
| **Action Controller** | Critical | RESTful APIs | Request handling |
| **Action View** | High | ERB, Hotwire | Frontend rendering |
| **Active Job** | High | Sidekiq, background jobs | Async processing |
| **Action Cable** | Medium | WebSocket, real-time | Live features |
| **Action Mailer** | Medium | Email delivery | Notifications |
| **Active Storage** | Medium | File uploads | Media management |
| **Pundit** | High | Authorization | Access control |

## Implementation Patterns

### 1. Service Objects Pattern
```ruby
# app/services/user_registration_service.rb
class UserRegistrationService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :email, :string
  attribute :password, :string
  attribute :first_name, :string
  attribute :last_name, :string

  validates :email, :password, :first_name, :last_name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }

  def call
    return failure(errors.full_messages) unless valid?

    ActiveRecord::Base.transaction do
      user = create_user
      send_welcome_email(user)
      create_user_profile(user)
      success(user)
    end
  rescue StandardError => e
    Rails.logger.error "User registration failed: #{e.message}"
    failure(['Registration failed. Please try again.'])
  end

  private

  def create_user
    User.create!(
      email: email,
      password: password,
      first_name: first_name,
      last_name: last_name
    )
  end

  def send_welcome_email(user)
    UserMailer.welcome_email(user).deliver_later
  end

  def create_user_profile(user)
    Profile.create!(user: user)
  end

  def success(data)
    OpenStruct.new(success?: true, data: data, errors: [])
  end

  def failure(errors)
    OpenStruct.new(success?: false, data: nil, errors: errors)
  end
end

# Usage in controller
def create
  service = UserRegistrationService.new(user_params)
  result = service.call

  if result.success?
    render json: UserSerializer.new(result.data).serializable_hash, status: :created
  else
    render json: { errors: result.errors }, status: :unprocessable_entity
  end
end
```

### 2. Background Jobs with Sidekiq
```ruby
# app/jobs/application_job.rb
class ApplicationJob < ActiveJob::Base
  include Sidekiq::Job
  
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  discard_on ActiveJob::DeserializationError

  around_perform do |job, block|
    Rails.logger.info "Starting job: #{job.class.name} with arguments: #{job.arguments}"
    start_time = Time.current
    
    block.call
    
    duration = Time.current - start_time
    Rails.logger.info "Completed job: #{job.class.name} in #{duration.round(2)} seconds"
  end
end

# app/jobs/order_confirmation_job.rb
class OrderConfirmationJob < ApplicationJob
  queue_as :default

  def perform(order)
    return unless order.confirmed?

    # Send confirmation email
    OrderMailer.confirmation_email(order).deliver_now
    
    # Update inventory
    order.order_items.each do |item|
      item.product.decrement!(:stock_quantity, item.quantity)
    end
    
    # Create audit log
    AuditLog.create!(
      user: order.user,
      action: 'order_confirmed',
      resource: order,
      details: { order_id: order.id, total: order.total_amount }
    )
    
    Rails.logger.info "Order #{order.id} confirmation processed successfully"
  end
end

# app/jobs/email_digest_job.rb
class EmailDigestJob < ApplicationJob
  queue_as :low_priority

  def perform(user_id, digest_type = 'weekly')
    user = User.find(user_id)
    return unless user.active?

    case digest_type
    when 'daily'
      send_daily_digest(user)
    when 'weekly'
      send_weekly_digest(user)
    when 'monthly'
      send_monthly_digest(user)
    end
  end

  private

  def send_daily_digest(user)
    recent_orders = user.orders.where(created_at: 1.day.ago..Time.current)
    UserMailer.daily_digest(user, recent_orders).deliver_now if recent_orders.any?
  end

  def send_weekly_digest(user)
    recent_activity = user.orders.where(created_at: 1.week.ago..Time.current)
    UserMailer.weekly_digest(user, recent_activity).deliver_now
  end

  def send_monthly_digest(user)
    monthly_stats = calculate_monthly_stats(user)
    UserMailer.monthly_digest(user, monthly_stats).deliver_now
  end

  def calculate_monthly_stats(user)
    {
      orders_count: user.orders.where(created_at: 1.month.ago..Time.current).count,
      total_spent: user.orders.where(created_at: 1.month.ago..Time.current).sum(:total_amount)
    }
  end
end
```

### 3. Real-time Features with Action Cable
```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      return reject_unauthorized_connection unless token

      begin
        decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
        user_id = decoded_token[0]['user_id']
        User.find(user_id)
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        reject_unauthorized_connection
      end
    end
  end
end

# app/channels/order_updates_channel.rb
class OrderUpdatesChannel < ApplicationCable::Channel
  def subscribed
    stream_from "order_updates_#{current_user.id}"
  end

  def unsubscribed
    # Cleanup when channel is unsubscribed
  end

  def receive(data)
    # Handle incoming messages from client
    case data['action']
    when 'ping'
      transmit({ type: 'pong', timestamp: Time.current.iso8601 })
    end
  end
end

# app/models/order.rb - Broadcasting updates
class Order < ApplicationRecord
  # ... existing code ...

  after_update_commit :broadcast_update
  after_create_commit :broadcast_creation

  private

  def broadcast_update
    ActionCable.server.broadcast(
      "order_updates_#{user_id}",
      {
        type: 'order_updated',
        order: OrderSerializer.new(self).serializable_hash,
        timestamp: Time.current.iso8601
      }
    )
  end

  def broadcast_creation
    ActionCable.server.broadcast(
      "order_updates_#{user_id}",
      {
        type: 'order_created',
        order: OrderSerializer.new(self).serializable_hash,
        timestamp: Time.current.iso8601
      }
    )
  end
end

# app/javascript/channels/order_updates_channel.js
import consumer from "./consumer"

const orderUpdatesChannel = consumer.subscriptions.create("OrderUpdatesChannel", {
  connected() {
    console.log("Connected to OrderUpdatesChannel")
  },

  disconnected() {
    console.log("Disconnected from OrderUpdatesChannel")
  },

  received(data) {
    console.log("Received:", data)
    
    switch(data.type) {
      case 'order_updated':
        this.handleOrderUpdate(data.order)
        break
      case 'order_created':
        this.handleOrderCreation(data.order)
        break
      case 'pong':
        console.log("Server pong:", data.timestamp)
        break
    }
  },

  handleOrderUpdate(order) {
    const orderElement = document.querySelector(`[data-order-id="${order.id}"]`)
    if (orderElement) {
      // Update order status in UI
      const statusElement = orderElement.querySelector('.order-status')
      if (statusElement) {
        statusElement.textContent = order.attributes.status
        statusElement.className = `order-status status-${order.attributes.status}`
      }
    }
  },

  handleOrderCreation(order) {
    // Add new order to the list
    const ordersList = document.querySelector('#orders-list')
    if (ordersList) {
      const orderHtml = this.renderOrderItem(order)
      ordersList.insertAdjacentHTML('afterbegin', orderHtml)
    }
  },

  renderOrderItem(order) {
    return `
      <div class="order-item" data-order-id="${order.id}">
        <h3>Order #${order.id}</h3>
        <p class="order-status status-${order.attributes.status}">
          ${order.attributes.status}
        </p>
        <p>Total: $${order.attributes.total_amount}</p>
      </div>
    `
  },

  ping() {
    this.perform('receive', { action: 'ping' })
  }
})

// Ping server every 30 seconds to keep connection alive
setInterval(() => {
  orderUpdatesChannel.ping()
}, 30000)

export default orderUpdatesChannel
```

### 4. Authorization with Pundit
```ruby
# app/policies/application_policy.rb
class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      raise NotImplementedError, "You must define #resolve in #{self.class}"
    end

    private

    attr_reader :user, :scope
  end
end

# app/policies/user_policy.rb
class UserPolicy < ApplicationPolicy
  def index?
    user&.admin?
  end

  def show?
    user&.admin? || user == record
  end

  def create?
    user&.admin?
  end

  def update?
    user&.admin? || user == record
  end

  def destroy?
    user&.admin? && user != record
  end

  def change_role?
    user&.admin? && user != record
  end

  class Scope < Scope
    def resolve
      if user&.admin?
        scope.all
      else
        scope.where(id: user.id)
      end
    end
  end
end

# app/policies/order_policy.rb
class OrderPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    user&.admin? || record.user == user
  end

  def create?
    user.present?
  end

  def update?
    user&.admin? || (record.user == user && record.pending?)
  end

  def destroy?
    user&.admin? || (record.user == user && record.may_cancel?)
  end

  def confirm?
    user&.admin? || (record.user == user && record.may_confirm?)
  end

  def cancel?
    user&.admin? || (record.user == user && record.may_cancel?)
  end

  class Scope < Scope
    def resolve
      if user&.admin?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
end
```

### 5. Testing with RSpec
```ruby
# spec/rails_helper.rb
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_path = "#{::Rails.root}/spec/fixtures"
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  # Factory Bot
  config.include FactoryBot::Syntax::Methods

  # Database Cleaner
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # Devise helpers
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include Devise::Test::IntegrationHelpers, type: :request

  # Pundit helpers
  config.include Pundit::RSpec::DSL, type: :policy
end

# Shoulda Matchers
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_many(:orders).dependent(:destroy) }
    it { should have_many(:posts).dependent(:destroy) }
    it { should have_one(:profile).dependent(:destroy) }
    it { should have_one_attached(:avatar) }
  end

  describe 'validations' do
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_length_of(:first_name).is_at_least(2).is_at_most(50) }
    it { should validate_length_of(:last_name).is_at_least(2).is_at_most(50) }
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(active: 0, inactive: 1, suspended: 2, pending_verification: 3) }
    it { should define_enum_for(:role).with_values(user: 0, admin: 1, moderator: 2) }
  end

  describe 'scopes' do
    let!(:active_user) { create(:user, status: :active) }
    let!(:inactive_user) { create(:user, status: :inactive) }
    let!(:admin_user) { create(:user, role: :admin) }

    describe '.active' do
      it 'returns only active users' do
        expect(User.active).to include(active_user)
        expect(User.active).not_to include(inactive_user)
      end
    end

    describe '.by_role' do
      it 'returns users with specified role' do
        expect(User.by_role(:admin)).to include(admin_user)
        expect(User.by_role(:admin)).not_to include(active_user)
      end
    end
  end

  describe 'instance methods' do
    let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }

    describe '#full_name' do
      it 'returns the full name' do
        expect(user.full_name).to eq('John Doe')
      end
    end

    describe '#admin?' do
      context 'when user is admin' do
        let(:admin) { create(:user, role: :admin) }
        
        it 'returns true' do
          expect(admin.admin?).to be true
        end
      end

      context 'when user is not admin' do
        it 'returns false' do
          expect(user.admin?).to be false
        end
      end
    end
  end

  describe 'callbacks' do
    describe 'after_create' do
      it 'creates a user profile' do
        expect { create(:user) }.to change(Profile, :count).by(1)
      end
    end
  end
end

# spec/controllers/api/v1/users_controller_spec.rb
RSpec.describe Api::V1::UsersController, type: :controller do
  let(:admin) { create(:user, role: :admin) }
  let(:regular_user) { create(:user) }
  let(:other_user) { create(:user) }

  before do
    allow(controller).to receive(:authenticate_api_user!)
  end

  describe 'GET #index' do
    context 'when user is admin' do
      before do
        allow(controller).to receive(:current_user).and_return(admin)
      end

      it 'returns all users' do
        create_list(:user, 3)
        get :index
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['users']).to be_present
      end
    end

    context 'when user is not admin' do
      before do
        allow(controller).to receive(:current_user).and_return(regular_user)
      end

      it 'returns unauthorized' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET #show' do
    context 'when viewing own profile' do
      before do
        allow(controller).to receive(:current_user).and_return(regular_user)
      end

      it 'returns the user' do
        get :show, params: { id: regular_user.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data']['id']).to eq(regular_user.id.to_s)
      end
    end

    context 'when viewing other user profile as regular user' do
      before do
        allow(controller).to receive(:current_user).and_return(regular_user)
      end

      it 'returns unauthorized' do
        get :show, params: { id: other_user.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

# spec/jobs/order_confirmation_job_spec.rb
RSpec.describe OrderConfirmationJob, type: :job do
  let(:order) { create(:order, :confirmed) }

  describe '#perform' do
    it 'sends confirmation email' do
      expect(OrderMailer).to receive(:confirmation_email).with(order).and_call_original
      expect_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now)
      
      described_class.new.perform(order)
    end

    it 'updates product inventory' do
      product = create(:product, stock_quantity: 10)
      create(:order_item, order: order, product: product, quantity: 2)
      
      expect { described_class.new.perform(order) }
        .to change { product.reload.stock_quantity }.from(10).to(8)
    end

    it 'creates audit log' do
      expect { described_class.new.perform(order) }
        .to change(AuditLog, :count).by(1)
    end
  end
end
```

## Expected Output

This template will produce:

- **Complete Rails Application**: Production-ready Rails 7+ application with modern conventions and best practices
- **RESTful API Architecture**: Comprehensive API controllers with proper serialization and error handling
- **Real-time Features**: Action Cable integration for WebSocket communication and live updates
- **Background Job Processing**: Sidekiq integration for asynchronous task processing
- **Authentication & Authorization**: Devise authentication with Pundit authorization policies
- **Comprehensive Testing**: RSpec test suite with factories, mocks, and integration tests
- **Modern Frontend Integration**: Hotwire (Turbo + Stimulus) for reactive user interfaces
- **Performance Optimization**: Database indexing, caching strategies, and query optimization
- **Production Deployment**: Docker, database migrations, and environment configuration

## Integration Points

- Connects with containerization modules for Docker deployment
- Integrates with Kubernetes modules for container orchestration
- Works with CI/CD modules for automated deployment pipelines
- Supports cloud platform modules for AWS, GCP, and Heroku deployment
- Compatible with monitoring modules for application observability

## Security Considerations

- Devise authentication with secure password hashing and session management
- Pundit authorization with role-based access control and policy enforcement
- CSRF protection and secure headers configuration
- SQL injection prevention through Active Record parameterized queries
- XSS protection with Rails built-in sanitization
- Secure file upload handling with Active Storage

## Performance Features

- Database connection pooling and query optimization
- Redis caching for session storage and application caching
- Background job processing with Sidekiq for async operations
- Database indexing strategies for optimal query performance
- Asset pipeline optimization with compression and CDN integration
- N+1 query prevention with includes and preloading

## Enterprise Features

- Comprehensive error handling and logging with structured output
- Health check endpoints for monitoring and load balancer integration
- Multi-environment configuration with Rails credentials
- Database migrations with rollback capabilities
- Audit logging for compliance and security tracking
- API versioning and backward compatibility support

This template provides a solid foundation for building modern Ruby on Rails applications with enterprise-grade features, comprehensive testing, and production-ready deployment configurations.
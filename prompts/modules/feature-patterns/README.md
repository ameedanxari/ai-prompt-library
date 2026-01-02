# Feature Pattern Modules

## Purpose
Reusable templates for common application features with production-ready defaults and best practices built-in.

## Instructions
Use these feature pattern modules to implement common application functionality with production-quality defaults. Each module includes security, accessibility, internationalization, and performance considerations. Select modules based on project requirements and combine them to build comprehensive feature sets.

## Examples
```markdown
## Example Feature Implementation

### Project: E-commerce Platform
**Required Features**: User authentication, product catalog, shopping cart, payment processing

### Selected Modules
1. **Authentication**: auth-oauth.md + auth-rbac.md
   - OAuth 2.0 with Google/Facebook login
   - Role-based access (customer, seller, admin)
   
2. **Data Management**: data-crud.md + data-validation.md
   - Product CRUD operations
   - Input validation for all forms
   
3. **UI Components**: ui-forms.md + ui-responsive.md
   - Checkout forms with validation
   - Mobile-responsive design
   
4. **Security**: security-encryption.md + security-compliance.md
   - Payment data encryption
   - PCI DSS compliance

### Result
- Complete authentication system with social login
- Secure product and order management
- Mobile-responsive user interface
- Compliance-ready security implementation
```

## Available Feature Patterns

### Authentication & Authorization
- [auth-oauth.md](./auth-oauth.md) - OAuth 2.0 / OpenID Connect setup
- [auth-rbac.md](./auth-rbac.md) - Role-based access control implementation

### Data Management
- [data-crud.md](./data-crud.md) - Create, Read, Update, Delete operations

### User Interface Components
- [ui-responsive.md](./ui-responsive.md) - Responsive design implementation

### Performance & Reliability
- [perf-offline.md](./perf-offline.md) - Offline functionality and sync

### Security Features
- [security-encryption.md](./security-encryption.md) - Data encryption at rest and in transit

### Related Modules
- [Technology Stacks](../technology-stacks/README.md) - Technology-specific implementations
- [Cross-Platform](../cross-platform/README.md) - Cross-platform parity modules
- [Testing](../testing/README.md) - Testing and mock data modules

## Usage Pattern
```markdown
#[[module:feature-patterns/auth-oauth.md|provider={{auth_provider}}]]
#[[module:feature-patterns/ui-responsive.md|breakpoints={{screen_sizes}}]]
```

## Integration with Best Practices
Each feature pattern automatically includes:
- Security considerations and implementation
- Accessibility compliance features
- Internationalization support
- Offline/network resilience
- Performance optimization
- Testing strategies
- Documentation requirements
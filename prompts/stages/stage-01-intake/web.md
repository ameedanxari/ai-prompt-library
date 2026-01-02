# Stage 01 - Intake: Web Platform Considerations

## Purpose
Process web-specific requirements, validate web platform choices, and establish web application foundation.

## Instructions

### How to Use This Stage

1. **Review Project Brief**: Analyze the user's project brief for web-specific requirements
2. **Assess Architecture Needs**: Determine the most appropriate web architecture pattern
3. **Select Technology Stack**: Choose optimal frameworks and tools for the project
4. **Define Performance Requirements**: Establish performance budgets and metrics
5. **Plan Security Implementation**: Define security headers, CSP, and authentication strategy
6. **Configure Deployment Strategy**: Select hosting platform and deployment approach
7. **Establish Testing Framework**: Define comprehensive testing strategy for web platform
8. **Document Decisions**: Record all web-specific architectural and technology decisions

### Stage Execution Steps

1. **Architecture Analysis**: Evaluate SPA vs SSR vs SSG vs JAMstack approaches
2. **Technology Selection**: Choose frontend framework, meta-framework, and tooling
3. **Performance Planning**: Set Core Web Vitals targets and optimization strategy
4. **Security Configuration**: Define CSP, security headers, and authentication approach
5. **Deployment Planning**: Select hosting platform and configure deployment pipeline
6. **Quality Assurance Setup**: Establish testing, accessibility, and performance monitoring
7. **Asset Optimization**: Plan image, font, and bundle optimization strategies

## Prerequisites

- Completed platform-agnostic intake stage (see [platform-agnostic.md](./platform-agnostic.md))
- User brief with web platform requirements
- Any existing web assets or designs in working_copy/
- Performance and security requirements identified

### Platform-Agnostic Foundation
This stage builds upon the platform-agnostic requirements established in [platform-agnostic.md](./platform-agnostic.md):
- **Core Intake Framework**: User input processing and requirements analysis
- **Asset Management Strategy**: Working copy structure and asset processing pipeline  
- **Project Configuration Framework**: Core configuration and technology stack foundation
- **Quality Assurance Framework**: Intake validation checklist and risk assessment
- **Requirements Analysis**: Functional and non-functional requirements extraction
- **Asset Processing Pipeline**: File type support and provenance tracking
- **Technology Stack Selection**: Decision framework and default technology stacks
- **User Input Processing**: Required fields validation and optional fields processing
- **Configuration Generation**: Project configuration structure and core configuration

The web-specific considerations below extend these core intake processes with web platform optimizations.

## Examples

### Example 1: E-commerce Web Application

```markdown
# Project Brief Analysis
Brief: "An e-commerce platform for handmade crafts with inventory management"
Platforms: Web (primary), Mobile (future)
Requirements: SEO, performance, payment processing, admin dashboard

# Architecture Decision
**Selected**: Server-Side Rendering (SSR) with Next.js
**Rationale**: 
- SEO critical for product discovery
- Dynamic content (inventory, pricing)
- Need for both customer and admin interfaces
- Performance requirements for conversion

# Technology Stack
{
  "framework": "React 18",
  "metaFramework": "Next.js 14",
  "typescript": true,
  "styling": "Tailwind CSS",
  "components": "Headless UI",
  "stateManagement": "Zustand",
  "database": "PostgreSQL with Prisma",
  "authentication": "NextAuth.js",
  "payments": "Stripe",
  "deployment": "Vercel"
}

# Performance Requirements
- LCP < 2.0s (product pages critical for conversion)
- FID < 100ms (smooth checkout experience)
- CLS < 0.1 (stable layout during loading)
- Bundle size < 200KB (fast initial load)

# Security Implementation
- CSP for XSS protection
- HTTPS enforcement with HSTS
- PCI DSS compliance for payments
- Rate limiting for API endpoints
- Input validation and sanitization

# SEO Strategy
- Server-side rendering for all product pages
- Structured data for products and reviews
- XML sitemap generation
- Open Graph and Twitter Card meta tags
- Google Analytics and Search Console integration
```

### Example 2: SaaS Dashboard Application

```markdown
# Project Brief Analysis
Brief: "A project management dashboard for remote teams with real-time collaboration"
Platforms: Web (desktop-focused)
Requirements: Real-time updates, offline capability, complex UI interactions

# Architecture Decision
**Selected**: Single Page Application (SPA) with PWA features
**Rationale**:
- Complex, interactive dashboard interface
- Real-time collaboration features
- Offline capability for productivity
- Desktop-focused usage patterns

# Technology Stack
{
  "framework": "React 18",
  "bundler": "Vite",
  "typescript": true,
  "styling": "Tailwind CSS + CSS Modules",
  "components": "Radix UI",
  "stateManagement": "Redux Toolkit + RTK Query",
  "realtime": "Socket.io",
  "offline": "Service Worker + IndexedDB",
  "authentication": "Auth0",
  "deployment": "Netlify"
}

# PWA Features
- Service worker for offline functionality
- Web app manifest for installation
- Background sync for offline actions
- Push notifications for team updates
- App shell architecture for fast loading

# Performance Optimization
- Code splitting by route and feature
- Lazy loading for non-critical components
- Virtual scrolling for large datasets
- Optimistic updates for better UX
- Efficient state management with RTK Query

# Real-time Architecture
- WebSocket connection for live updates
- Conflict resolution for collaborative editing
- Presence indicators for team members
- Real-time notifications and alerts
- Offline queue for actions when disconnected
```

### Example 3: Marketing Website with Blog

```markdown
# Project Brief Analysis
Brief: "A marketing website for a SaaS product with integrated blog and documentation"
Platforms: Web (SEO-focused)
Requirements: Fast loading, excellent SEO, content management, lead generation

# Architecture Decision
**Selected**: Static Site Generation (SSG) with Incremental Static Regeneration
**Rationale**:
- Excellent SEO and performance
- Content-heavy with blog and documentation
- Infrequent content updates
- Global CDN distribution benefits

# Technology Stack
{
  "framework": "React 18",
  "metaFramework": "Next.js 14 (SSG mode)",
  "typescript": true,
  "styling": "Tailwind CSS",
  "components": "Headless UI",
  "cms": "Sanity CMS",
  "search": "Algolia",
  "analytics": "Google Analytics 4",
  "deployment": "Vercel with CDN"
}

# Content Strategy
- Headless CMS for blog and marketing content
- MDX for documentation with code examples
- Automated sitemap generation
- RSS feed for blog content
- Search functionality with Algolia

# Performance Optimization
- Static generation for all marketing pages
- ISR for blog posts (revalidate on content changes)
- Image optimization with Next.js Image component
- Critical CSS inlining
- Preloading for key user journeys

# SEO Implementation
- Server-side rendering for all content
- Structured data for articles and organization
- Open Graph and Twitter Card optimization
- XML sitemap with priority and change frequency
- Google Search Console and Analytics integration
```

### Example 4: Web-based Design Tool

```markdown
# Project Brief Analysis
Brief: "A browser-based design tool for creating social media graphics"
Platforms: Web (desktop and tablet)
Requirements: Canvas manipulation, real-time rendering, file export, collaboration

# Architecture Decision
**Selected**: Single Page Application with Canvas API and WebGL
**Rationale**:
- Complex canvas-based interactions
- Real-time rendering requirements
- Desktop-class functionality in browser
- File manipulation and export features

# Technology Stack
{
  "framework": "React 18",
  "canvas": "Fabric.js + Three.js",
  "bundler": "Webpack 5",
  "typescript": true,
  "styling": "Styled Components",
  "stateManagement": "Zustand + Immer",
  "fileHandling": "File System Access API",
  "collaboration": "Yjs + WebRTC",
  "deployment": "AWS CloudFront + S3"
}

# Canvas Architecture
- Fabric.js for 2D design elements
- Three.js for 3D effects and rendering
- OffscreenCanvas for background processing
- Web Workers for heavy computations
- WebGL for hardware acceleration

# File Management
- File System Access API for local file operations
- Canvas-to-blob conversion for exports
- Multiple export formats (PNG, JPG, SVG, PDF)
- Cloud storage integration for project saves
- Version history and auto-save functionality

# Collaboration Features
- Real-time cursor tracking
- Operational transformation for concurrent edits
- WebRTC for peer-to-peer communication
- Conflict resolution for simultaneous changes
- Comment and annotation system

# Performance Considerations
- Canvas virtualization for large designs
- Efficient re-rendering with dirty checking
- Memory management for large images
- Progressive loading for assets
- Background processing for exports
```

## Web Platform Analysis

### Web Application Architecture Assessment
```markdown
## Architecture Pattern Selection

### Architecture Options Analysis
#### Single Page Application (SPA)
**Best For**: Interactive dashboards, admin panels, complex user interfaces
**Technology Stack**: React/Vue/Angular + Client-side routing
**Pros**: Rich interactivity, smooth user experience, offline capability
**Cons**: SEO challenges, initial load time, JavaScript dependency

#### Server-Side Rendering (SSR)
**Best For**: Content-heavy sites, e-commerce, marketing sites
**Technology Stack**: Next.js, Nuxt.js, SvelteKit
**Pros**: Better SEO, faster initial load, progressive enhancement
**Cons**: Server complexity, higher hosting costs, cache complexity

#### Static Site Generation (SSG)
**Best For**: Blogs, documentation, marketing sites, portfolios
**Technology Stack**: Gatsby, Next.js, Astro, Hugo
**Pros**: Excellent performance, CDN-friendly, high security
**Cons**: Build time scaling, dynamic content limitations

#### Headless/JAMstack
**Best For**: Multi-channel content, API-first applications
**Technology Stack**: Headless CMS + Static generator + APIs
**Pros**: Flexibility, scalability, developer experience
**Cons**: Complexity, multiple services, content management

### Web-Specific Requirements Analysis
#### Performance Requirements
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Page Load Speed**: First Contentful Paint < 1.5s
- **Bundle Size**: JavaScript bundle < 250KB gzipped
- **Image Optimization**: WebP/AVIF support, lazy loading
- **Caching Strategy**: Service worker, CDN, browser caching

#### SEO and Discoverability
- **Meta Tags**: Open Graph, Twitter Cards, structured data
- **URL Structure**: Clean, semantic URLs with proper hierarchy
- **Sitemap Generation**: Automated XML sitemap creation
- **Robot.txt**: Search engine crawling guidelines
- **Analytics Integration**: Google Analytics, search console setup
```

### Web Technology Stack Validation
```markdown
## Technology Stack Assessment

### Frontend Framework Selection
#### React Ecosystem
**Recommended For**: Complex UIs, large teams, extensive ecosystem
```json
{
  "framework": "React 18+",
  "metaFramework": "Next.js 14+",
  "typescript": true,
  "styling": "Tailwind CSS",
  "components": "Headless UI / Radix UI",
  "stateManagement": "Zustand / Redux Toolkit",
  "routing": "Next.js App Router",
  "testing": "Jest + React Testing Library"
}
```

#### Vue Ecosystem
**Recommended For**: Progressive adoption, gentle learning curve
```json
{
  "framework": "Vue 3",
  "metaFramework": "Nuxt 3",
  "typescript": true,
  "styling": "Tailwind CSS",
  "components": "Headless UI Vue",
  "stateManagement": "Pinia",
  "routing": "Vue Router",
  "testing": "Vitest + Vue Testing Library"
}
```

#### Svelte Ecosystem
**Recommended For**: Performance-critical apps, smaller bundles
```json
{
  "framework": "Svelte 4+",
  "metaFramework": "SvelteKit",
  "typescript": true,
  "styling": "Tailwind CSS",
  "components": "Skeleton UI",
  "stateManagement": "Svelte stores",
  "routing": "SvelteKit routing",
  "testing": "Vitest + Svelte Testing Library"
}
```

### Web-Specific Feature Requirements
#### Progressive Web App (PWA) Features
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: App-like installation experience
- **Push Notifications**: Re-engagement capabilities
- **Background Sync**: Offline action synchronization
- **App Shell Architecture**: Fast loading and navigation

#### Responsive Design Requirements
- **Breakpoints**: Mobile-first responsive design
- **Touch Interactions**: Touch-friendly interface elements
- **Viewport Optimization**: Proper viewport meta tags
- **Flexible Layouts**: CSS Grid and Flexbox utilization
- **Image Responsiveness**: Responsive images with srcset

#### Web Accessibility (WCAG 2.1 AA)
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Descriptive alt text for images
```

## Web Deployment Strategy

### Hosting Platform Assessment
```markdown
## Deployment Platform Selection

### Static Hosting Platforms
#### Vercel
**Best For**: Next.js applications, serverless functions
**Features**: Edge functions, automatic deployments, analytics
**Pricing**: Generous free tier, pay-per-use scaling
**Integration**: GitHub, GitLab, Bitbucket integration

#### Netlify
**Best For**: JAMstack sites, form handling, A/B testing
**Features**: Edge functions, form processing, split testing
**Pricing**: Free tier available, usage-based pricing
**Integration**: Git-based deployments, CMS integrations

#### Cloudflare Pages
**Best For**: Global distribution, security features
**Features**: Edge computing, DDoS protection, analytics
**Pricing**: Free tier with generous limits
**Integration**: GitHub, GitLab integration

### Full-Stack Hosting Platforms
#### Railway
**Best For**: Full-stack applications with databases
**Features**: Automatic deployments, database hosting, monitoring
**Pricing**: Usage-based pricing, free tier available
**Integration**: GitHub integration, multiple languages

#### Heroku
**Best For**: Rapid prototyping, established ecosystem
**Features**: Add-ons marketplace, easy scaling, monitoring
**Pricing**: Free tier discontinued, paid plans available
**Integration**: Git-based deployments, extensive add-ons

### CDN and Performance Optimization
#### Content Delivery Network
- **Global Distribution**: Edge locations worldwide
- **Asset Optimization**: Image compression, minification
- **Caching Strategy**: Browser and CDN caching rules
- **SSL/TLS**: Automatic HTTPS certificate management
- **Performance Monitoring**: Real user monitoring (RUM)

#### Web Performance Budget
```json
{
  "performance": {
    "budgets": {
      "javascript": "250KB",
      "css": "50KB",
      "images": "500KB",
      "fonts": "100KB",
      "total": "1MB"
    },
    "metrics": {
      "fcp": "< 1.5s",
      "lcp": "< 2.5s",
      "fid": "< 100ms",
      "cls": "< 0.1",
      "ttfb": "< 600ms"
    }
  }
}
```
```

## Web Security Considerations

### Security Framework
```markdown
## Web Security Requirements

### Content Security Policy (CSP)
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
```

### Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Authentication and Authorization
#### Authentication Options
- **OAuth 2.0 / OpenID Connect**: Social login integration
- **JWT Tokens**: Stateless authentication
- **Session-based**: Traditional server-side sessions
- **Multi-factor Authentication**: Enhanced security
- **Passwordless**: Magic links, biometric authentication

#### Authorization Patterns
- **Role-Based Access Control (RBAC)**: User roles and permissions
- **Attribute-Based Access Control (ABAC)**: Fine-grained permissions
- **Resource-Based Permissions**: Object-level access control
- **API Key Management**: Service-to-service authentication

### Data Protection
#### Privacy Compliance
- **GDPR Compliance**: EU data protection requirements
- **CCPA Compliance**: California privacy regulations
- **Cookie Consent**: User consent for tracking cookies
- **Data Minimization**: Collect only necessary data
- **Right to Deletion**: User data removal capabilities

#### Encryption and Storage
- **Data in Transit**: TLS 1.3 encryption
- **Data at Rest**: Database encryption
- **Sensitive Data**: PII encryption and tokenization
- **Key Management**: Secure key storage and rotation
- **Backup Security**: Encrypted backup storage
```

## Web-Specific Quality Assurance

### Testing Strategy
```markdown
## Web Testing Framework

### Browser Compatibility Testing
#### Target Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: Chrome Mobile, Safari Mobile, Samsung Internet
- **Legacy Support**: IE 11 (if required), older mobile browsers
- **Testing Tools**: BrowserStack, Sauce Labs, Playwright

### Performance Testing
#### Core Web Vitals Monitoring
- **Lighthouse CI**: Automated performance auditing
- **WebPageTest**: Detailed performance analysis
- **Real User Monitoring**: Production performance tracking
- **Synthetic Monitoring**: Continuous performance validation

### Accessibility Testing
#### Automated Testing
- **axe-core**: Automated accessibility testing
- **Lighthouse**: Accessibility audit integration
- **Pa11y**: Command-line accessibility testing
- **WAVE**: Web accessibility evaluation

#### Manual Testing
- **Screen Reader Testing**: NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Tab order and focus management
- **Color Contrast**: Manual contrast validation
- **Cognitive Load**: Usability and comprehension testing

### Security Testing
#### Vulnerability Assessment
- **OWASP ZAP**: Automated security scanning
- **Snyk**: Dependency vulnerability scanning
- **Security Headers**: Header configuration validation
- **SSL Labs**: SSL/TLS configuration testing

### SEO and Analytics Validation
#### SEO Testing
- **Google Search Console**: Search performance monitoring
- **Structured Data Testing**: Rich snippets validation
- **Page Speed Insights**: Performance and SEO analysis
- **Mobile-Friendly Test**: Mobile usability validation

#### Analytics Implementation
- **Google Analytics 4**: User behavior tracking
- **Google Tag Manager**: Tag management system
- **Conversion Tracking**: Goal and event tracking
- **Privacy-Compliant Analytics**: GDPR-compliant tracking
```

## Web Asset Optimization

### Asset Processing Pipeline
```markdown
## Web Asset Management

### Image Optimization
#### Format Selection
- **WebP**: Modern format with excellent compression
- **AVIF**: Next-generation format for supported browsers
- **JPEG**: Fallback for photographic content
- **PNG**: Transparency and graphics
- **SVG**: Vector graphics and icons

#### Optimization Techniques
- **Responsive Images**: Multiple sizes with srcset
- **Lazy Loading**: Intersection Observer API
- **Image CDN**: Automatic optimization and delivery
- **Compression**: Lossless and lossy optimization
- **Critical Images**: Preload above-the-fold images

### Font Optimization
#### Web Font Strategy
- **Font Display**: font-display: swap for better performance
- **Preload**: Critical font preloading
- **Subsetting**: Include only used characters
- **Variable Fonts**: Single file for multiple weights
- **Fallback Fonts**: System font fallbacks

### JavaScript and CSS Optimization
#### Bundle Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Remove unused code
- **Minification**: Remove whitespace and comments
- **Compression**: Gzip and Brotli compression
- **Critical CSS**: Inline critical path CSS

#### Loading Strategy
- **Preload**: Critical resources preloading
- **Prefetch**: Next-page resource prefetching
- **Module Federation**: Micro-frontend architecture
- **Service Worker**: Advanced caching strategies
```

This web-specific intake analysis ensures optimal web platform configuration and sets the foundation for high-performance, accessible, and secure web applications.

## Next Steps
- **Stage 02 - Charter**: Web platform charter and scope definition
- **Technology Validation**: Confirm web technology stack choices
- **Performance Baseline**: Establish performance benchmarks
- **Security Review**: Validate security requirements and implementation
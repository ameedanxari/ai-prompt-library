# AI Prompt Library - User Input Template

## Purpose
Serve as both user input form and project README, collecting project requirements and configuration preferences to generate comprehensive software specifications.

## Instructions
Fill out the Project Brief section (required) and any optional configuration sections that apply to your project. Leave sections blank to use production-quality defaults. Place any reference materials in the working_copy/ directory for automatic processing.

## Examples
```markdown
## Example Project Brief

**Brief**: "A task management app for remote teams that works offline and syncs when connected. Teams need to create projects, assign tasks, track progress, and communicate about work items. Should work on both web and mobile with real-time updates when online."

**Configuration Selected**:
- Platforms: ✅ Web Application, ✅ iOS Mobile App, ✅ Android Mobile App
- Mobile Approach: ✅ React Native (cross-platform)
- Web Architecture: ✅ Server-Side Rendered (SSR)
- Cloud Provider: ✅ Let system choose cost-optimal option
- Budget: ✅ Standard ($50-200/month)
- Languages: Primary: English, Additional: Spanish
- Accessibility: ✅ WCAG 2.1 AA compliance
- Token Usage: ✅ Medium: Verify at key checkpoints

**Result**: System generates comprehensive specifications for a React Native + Next.js task management platform with offline capabilities, real-time sync, and bilingual support.
```

*This template serves as both your input form and project README. Fill out the sections below to generate comprehensive software specifications.*

## Project Brief (Required)

**What do you want to build and why?**

<!-- 
Fill in your project description here. This can be anywhere from 2-3 lines to a detailed description.
Examples:
- "A task management app for remote teams that works offline and syncs when connected"
- "An e-commerce platform for local artisans with multi-language support and mobile apps"
- "A real-time chat application with video calls and file sharing for educational institutions"
-->

[Your project description here]

---

## Optional Configuration (Power Users)

*Leave any section blank to use production-quality defaults with maximum feature completeness.*

### Target Platforms
<!-- Check all that apply -->
- [ ] Web Application
- [ ] iOS Mobile App  
- [ ] Android Mobile App
- [ ] Desktop Application
- [ ] API/Backend Only

### Technology Preferences

**Mobile Development Approach:**
- [ ] Native iOS/Android (separate codebases)
- [ ] React Native (cross-platform)
- [ ] Flutter (cross-platform)
- [ ] Progressive Web App (PWA)
- [ ] Let system choose optimal approach

**Web Architecture:**
- [ ] Headless/API-first
- [ ] JAMstack (Static + APIs)
- [ ] Single Page Application (SPA)
- [ ] Server-Side Rendered (SSR)
- [ ] Traditional Multi-Page App
- [ ] Let system choose optimal approach

**Backend Architecture:**
- [ ] Serverless Functions
- [ ] Microservices
- [ ] Monolithic Application
- [ ] Backend-as-a-Service (BaaS)
- [ ] Let system choose optimal approach

### Deployment Environment

**Cloud Provider:**
- [ ] AWS (Amazon Web Services)
- [ ] Azure (Microsoft)
- [ ] Google Cloud Platform (GCP)
- [ ] Heroku
- [ ] Vercel
- [ ] Netlify
- [ ] Let system choose cost-optimal option

**Budget Preference:**
- [ ] Free tier only
- [ ] Low cost (<$50/month)
- [ ] Standard ($50-200/month)
- [ ] Enterprise (>$200/month)
- [ ] Let system optimize for cost

### Localization and Accessibility

**Target Languages:**
<!-- List languages or leave blank for English-only -->
- Primary: [e.g., English]
- Additional: [e.g., Spanish, French, Arabic]

**Accessibility Requirements:**
- [ ] WCAG 2.1 AA compliance (recommended)
- [ ] WCAG 2.1 AAA compliance (highest)
- [ ] Basic accessibility features
- [ ] Let system apply best practices

**Right-to-Left (RTL) Support:**
- [ ] Yes, include RTL language support
- [ ] No, LTR languages only
- [ ] Let system decide based on target languages

### Design and Branding

**Color Theme Preference:**
- [ ] Light mode only
- [ ] Dark mode only
- [ ] Both light and dark modes (recommended)
- [ ] System-adaptive theme

**Branding Requirements:**
- [ ] White-label ready (rebrandable)
- [ ] Fixed branding
- [ ] Let system create flexible design system

**Design Assets Available:**
- [ ] I have existing designs/mockups (place in working_copy/designs/)
- [ ] I have brand guidelines (place in working_copy/specifications/)
- [ ] I have color schemes/logos (place in working_copy/assets/)
- [ ] Generate everything from scratch

### Advanced Configuration

**Architecture Preferences:**
- [ ] Modular/microservices architecture
- [ ] Monolithic architecture
- [ ] Event-driven architecture
- [ ] Let system choose optimal approach

**Database Preferences:**
- [ ] SQL Database (PostgreSQL, MySQL)
- [ ] NoSQL Database (MongoDB, DynamoDB)
- [ ] Hybrid SQL + NoSQL
- [ ] Let system choose optimal approach

**Authentication Preferences:**
- [ ] Email/Password authentication
- [ ] Social login (Google, Facebook, etc.)
- [ ] Enterprise SSO (SAML, OAuth)
- [ ] Multi-factor authentication (MFA)
- [ ] Let system include comprehensive auth

**Token Usage Level:**
- [ ] **Low**: Generate specs, I'll handle build/test (fastest, lowest cost)
- [ ] **Medium**: Verify at key checkpoints (balanced approach)
- [ ] **High**: Comprehensive verification with full testing (thorough, higher cost)

---

## Reference Assets (Optional)

*Place any reference materials in the `working_copy/` directory:*

### Available Assets
- **Designs/Mockups**: `working_copy/designs/` - UI designs, wireframes, prototypes
- **Specifications**: `working_copy/specifications/` - Existing requirements, API docs
- **Data Samples**: `working_copy/data-samples/` - Sample data, schemas, examples
- **Brand Assets**: `working_copy/assets/` - Logos, icons, images, style guides

### Asset Processing
The system will automatically:
- Reorganize assets into standardized structure
- Create mapping documentation for asset locations
- Maintain provenance tracking for all files
- Reference assets in generated specifications

---

## Dry-Run Option

**Validation Mode:**
- [ ] **Full Generation**: Complete specifications and implementation plans
- [ ] **Dry-Run**: Abbreviated output for validation and token estimation

*Dry-run mode generates summary outputs with key decisions and assumptions, allowing you to validate the approach before full generation.*

---

## Getting Started

1. **Fill out the Project Brief** (required)
2. **Configure optional settings** or leave blank for optimal defaults
3. **Add reference assets** to `working_copy/` if available
4. **Choose token usage level** based on your needs
5. **Run the generation pipeline** starting with Stage 01

The system will transform your input into comprehensive specifications, task lists, and implementation prompts optimized for AI agent execution.

---

## System Capabilities

This AI Prompt Library automatically includes:

### Production-Ready Features
- Role-based access control and admin portals
- Logging, analytics, and monitoring
- Security and privacy best practices
- Offline capabilities and network optimization
- Internationalization and accessibility compliance
- Responsive design for all screen sizes

### Development Best Practices
- Modular, extensible architecture
- Comprehensive testing strategy (unit + property-based)
- CI/CD pipeline configuration
- Documentation generation
- Error handling and graceful degradation
- Performance optimization

### Cross-Platform Consistency
- Feature parity across all platforms
- Shared API contracts and data models
- Consistent design patterns and user experience
- Platform-specific optimizations where beneficial

### AI-Optimized Outputs
- Context-agnostic task lists
- Self-contained implementation prompts
- Comprehensive state management
- Build command preservation
- Quality assurance checkpoints

---

*Ready to begin? Fill out your Project Brief above and start the generation pipeline!*
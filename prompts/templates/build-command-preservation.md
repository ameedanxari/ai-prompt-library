# Build Command Preservation Template

## Purpose
Store and maintain successful build and test commands in repository documentation to enable context-free command execution by any AI agent, eliminating the need to rediscover working configurations.

## Instructions

### How to Use Build Command Preservation

1. **Document Successful Commands**: Record every command that successfully builds or tests the project
2. **Include Context**: Add timestamps, environment details, and success indicators
3. **Maintain History**: Keep a log of command evolution and changes over time
4. **Verify Before Storage**: Only store commands that have been tested and confirmed working
5. **Update Regularly**: Keep the command registry current with the latest working configurations
6. **Provide Fallbacks**: Include alternative commands for different scenarios

### Command Documentation Process

1. **Test Command**: Verify the command works in current environment
2. **Record Success**: Document the command with timestamp and context
3. **Add to Registry**: Update the central command registry
4. **Include Variations**: Document any platform-specific or environment-specific variations
5. **Maintain History**: Keep previous versions for rollback if needed

## Examples

### Example 1: Node.js Project Command Registry

```markdown
# Build Command Registry - Task Management App

## Last Updated: 2024-01-15
## Project: React + TypeScript + Vite

### Current Working Commands

#### Build Commands
```bash
# Production build (Last successful: 2024-01-15 14:30)
npm run build
# Output: dist/ directory with optimized assets
# Duration: ~45 seconds
# Dependencies: All packages installed

# Development build (Last successful: 2024-01-15 14:25)
npm run dev
# Output: Development server on http://localhost:5173
# Hot reload: Enabled
# TypeScript checking: Enabled
```

#### Test Commands
```bash
# Unit tests (Last successful: 2024-01-15 14:20)
npm test
# Coverage: 87% (target: 85%+)
# Duration: ~12 seconds
# Files: 156 test files

# E2E tests (Last successful: 2024-01-15 13:45)
npm run test:e2e
# Browser: Chromium headless
# Duration: ~3 minutes
# Tests: 24 scenarios
```

#### Quality Commands
```bash
# Linting (Last successful: 2024-01-15 14:15)
npm run lint
# ESLint + Prettier
# Files: TypeScript and React files
# Auto-fix: Available with --fix

# Type checking (Last successful: 2024-01-15 14:10)
npm run type-check
# TypeScript compiler check
# No emit, check only
```

### Command History
- **2024-01-15**: Updated to Vite 5.0, build time improved by 30%
- **2024-01-10**: Added E2E tests with Playwright
- **2024-01-05**: Initial command registry setup
```

### Example 2: Python Project Command Registry

```markdown
# Build Command Registry - API Service

## Last Updated: 2024-01-15
## Project: FastAPI + PostgreSQL + Docker

### Current Working Commands

#### Development Setup
```bash
# Virtual environment setup (Last successful: 2024-01-15 10:00)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Database setup (Last successful: 2024-01-15 10:05)
docker-compose up -d postgres
alembic upgrade head
```

#### Application Commands
```bash
# Development server (Last successful: 2024-01-15 10:10)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API docs: http://localhost:8000/docs
# Auto-reload: Enabled

# Production server (Last successful: 2024-01-14 16:30)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
# Workers: 4
# Production optimized
```

#### Testing Commands
```bash
# Unit tests (Last successful: 2024-01-15 09:45)
pytest tests/ -v --cov=app --cov-report=html
# Coverage: 92%
# HTML report: htmlcov/index.html

# Integration tests (Last successful: 2024-01-15 09:50)
pytest tests/integration/ -v
# Database: Test database required
# Duration: ~2 minutes
```
```

## Core Principles
- **Command Preservation**: Store all successful build and test commands with context
- **Context Independence**: Commands should be executable without prior conversation history
- **Success Tracking**: Only store commands that have been verified to work
- **Historical Maintenance**: Maintain command history with timestamps and success indicators

## Build Command Documentation Framework

### Command Registry Template
```markdown
# Build Command Registry

## Last Updated
**Date**: [Current date]
**Updated By**: [Agent ID or session identifier]
**Project Phase**: [Current development phase]

## Current Working Commands

### Build Commands
```bash
# Primary build command (Last successful: [Date])
npm run build

# Development build (Last successful: [Date])
npm run build:dev

# Production build (Last successful: [Date])
npm run build:prod

# Clean build (Last successful: [Date])
npm run clean && npm run build
```

### Test Commands
```bash
# All tests (Last successful: [Date])
npm test -- --run

# Unit tests only (Last successful: [Date])
npm run test:unit -- --run

# Integration tests (Last successful: [Date])
npm run test:integration -- --run

# Property-based tests (Last successful: [Date])
npm run test:property -- --run

# Test with coverage (Last successful: [Date])
npm run test:coverage -- --run
```

### Development Commands
```bash
# Start development server (Last successful: [Date])
npm run dev

# Lint code (Last successful: [Date])
npm run lint

# Format code (Last successful: [Date])
npm run format

# Type checking (Last successful: [Date])
npm run type-check
```

### Deployment Commands
```bash
# Deploy to staging (Last successful: [Date])
npm run deploy:staging

# Deploy to production (Last successful: [Date])
npm run deploy:prod

# Build and deploy (Last successful: [Date])
npm run build && npm run deploy
```

## Command History Log

### Recent Successful Commands (Last 30 Days)
| Date | Command | Context | Duration | Notes |
|------|---------|---------|----------|-------|
| [Date] | `npm test -- --run` | After feature implementation | 45s | All tests passed |
| [Date] | `npm run build:prod` | Production deployment | 2m 15s | Clean build successful |
| [Date] | `npm run test:property -- --run` | Property test validation | 1m 30s | 100 iterations passed |

### Command Evolution History
| Date | Old Command | New Command | Reason for Change |
|------|-------------|-------------|-------------------|
| [Date] | `npm test` | `npm test -- --run` | Avoid watch mode in CI |
| [Date] | `npm run build` | `npm run build:prod` | Environment-specific builds |

## Platform-Specific Commands

### macOS/Linux Commands
```bash
# Build with environment setup
export NODE_ENV=production && npm run build

# Test with memory optimization
NODE_OPTIONS="--max-old-space-size=4096" npm test -- --run

# Development with file watching
npm run dev -- --watch
```

### Windows Commands
```cmd
# Build with environment setup
set NODE_ENV=production && npm run build

# Test with memory optimization
set NODE_OPTIONS=--max-old-space-size=4096 && npm test -- --run

# Development with file watching
npm run dev -- --watch
```

### Docker Commands
```bash
# Build in container
docker build -t project-name .

# Run tests in container
docker run --rm project-name npm test -- --run

# Development with volume mounting
docker run -v $(pwd):/app project-name npm run dev
```

## Command Context Documentation

### Environment Requirements
```markdown
## Environment Setup for Commands

### Node.js Version
**Required**: Node.js >= [version]
**Recommended**: Node.js [specific version]
**Verification**: `node --version`

### Package Manager
**Primary**: npm (version [version])
**Alternative**: yarn (version [version])
**Verification**: `npm --version`

### System Dependencies
- **Operating System**: [Supported OS versions]
- **Memory Requirements**: Minimum [X]GB RAM for builds
- **Disk Space**: Minimum [X]GB free space
- **Network**: Required for package installation

### Environment Variables
```bash
# Required environment variables
export NODE_ENV=production
export API_URL=https://api.example.com
export DATABASE_URL=postgresql://localhost:5432/dbname

# Optional environment variables
export LOG_LEVEL=info
export CACHE_TTL=3600
```

### Pre-Command Setup
```bash
# Ensure dependencies are installed
npm install

# Ensure environment is clean
npm run clean

# Ensure database is ready (if applicable)
npm run db:migrate
```
```

### Command Troubleshooting Guide
```markdown
## Command Troubleshooting

### Common Build Issues
**Issue**: `npm run build` fails with memory error
**Solution**: Use `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
**Last Verified**: [Date]

**Issue**: Build fails with missing dependencies
**Solution**: Run `npm install` then retry build
**Last Verified**: [Date]

**Issue**: TypeScript compilation errors
**Solution**: Run `npm run type-check` first, fix errors, then build
**Last Verified**: [Date]

### Common Test Issues
**Issue**: Tests timeout in CI environment
**Solution**: Use `npm test -- --run --timeout=60000`
**Last Verified**: [Date]

**Issue**: Property tests fail intermittently
**Solution**: Increase iterations: `npm run test:property -- --run --iterations=200`
**Last Verified**: [Date]

**Issue**: Tests fail due to port conflicts
**Solution**: Use `PORT=0 npm test -- --run` for random port assignment
**Last Verified**: [Date]

### Performance Optimization
**Slow Builds**: Use `npm run build -- --parallel` for parallel processing
**Slow Tests**: Use `npm test -- --run --parallel` for parallel test execution
**Memory Issues**: Increase Node.js heap size with `NODE_OPTIONS="--max-old-space-size=8192"`
```

## Command Validation Framework

### Command Success Verification
```markdown
## Command Validation Checklist

### Build Command Validation
- [ ] Command executes without errors
- [ ] Build artifacts are generated correctly
- [ ] Build output is functional
- [ ] Build time is reasonable (< [X] minutes)
- [ ] No security vulnerabilities in dependencies

### Test Command Validation
- [ ] All tests pass consistently
- [ ] Test coverage meets requirements (> [X]%)
- [ ] Tests complete within reasonable time (< [X] minutes)
- [ ] No flaky or intermittent test failures
- [ ] Property tests run sufficient iterations (>= 100)

### Development Command Validation
- [ ] Development server starts successfully
- [ ] Hot reload functionality works
- [ ] All features accessible in development mode
- [ ] No console errors or warnings
- [ ] Performance is acceptable for development

### Deployment Command Validation
- [ ] Deployment completes successfully
- [ ] Application is accessible after deployment
- [ ] All features work in deployed environment
- [ ] No runtime errors in production logs
- [ ] Performance meets production requirements
```

### Automated Command Testing
```bash
#!/bin/bash
# Command validation script

echo "Validating build commands..."

# Test build command
if npm run build; then
    echo "✅ Build command successful"
    echo "$(date): npm run build - SUCCESS" >> .command-history/build-log.txt
else
    echo "❌ Build command failed"
    echo "$(date): npm run build - FAILED" >> .command-history/build-log.txt
    exit 1
fi

# Test test command
if npm test -- --run; then
    echo "✅ Test command successful"
    echo "$(date): npm test -- --run - SUCCESS" >> .command-history/test-log.txt
else
    echo "❌ Test command failed"
    echo "$(date): npm test -- --run - FAILED" >> .command-history/test-log.txt
    exit 1
fi

echo "All commands validated successfully"
```

## Integration with Project Documentation

### README.md Integration
```markdown
## Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test -- --run
```

### Production
```bash
# Build for production
npm run build:prod

# Run production tests
npm run test:prod -- --run

# Deploy to production
npm run deploy:prod
```

### Troubleshooting
If commands fail, check the project documentation for the latest working commands and troubleshooting tips.
```

### CI/CD Integration
```yaml
# GitHub Actions workflow using preserved commands
name: Build and Test
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      # Use preserved commands from registry
      - name: Install dependencies
        run: npm install
      
      - name: Run build (from command registry)
        run: npm run build:prod
      
      - name: Run tests (from command registry)
        run: npm test -- --run --timeout=60000
      
      - name: Update command registry on success
        run: |
          echo "$(date): CI build and test - SUCCESS" >> .command-history/ci-log.txt
          git add .command-history/
          git commit -m "Update command history [skip ci]" || true
```

## Command Maintenance Protocols

### Regular Maintenance Tasks
```markdown
## Command Registry Maintenance

### Weekly Tasks
- [ ] Verify all current working commands still function
- [ ] Update last successful execution dates
- [ ] Clean up old command history entries (keep last 100)
- [ ] Check for new commands that should be preserved

### Monthly Tasks
- [ ] Review command performance and optimization opportunities
- [ ] Update environment requirements and dependencies
- [ ] Consolidate similar commands and remove duplicates
- [ ] Update troubleshooting guide with new issues/solutions

### Quarterly Tasks
- [ ] Audit all preserved commands for relevance
- [ ] Update platform-specific command variations
- [ ] Review and update command validation scripts
- [ ] Assess need for new command categories or organization
```

### Command Deprecation Process
```markdown
## Command Deprecation

### When to Deprecate Commands
- Command no longer works due to dependency changes
- Command has been superseded by a better alternative
- Command is no longer relevant to current project state
- Command has security vulnerabilities

### Deprecation Process
1. Mark command as deprecated with date and reason
2. Provide alternative command or migration path
3. Keep deprecated command for 30 days for reference
4. Remove deprecated command and update documentation
5. Update any scripts or documentation that referenced old command

### Deprecation Documentation
```markdown
## Deprecated Commands

### Recently Deprecated
| Date | Command | Reason | Alternative |
|------|---------|--------|-------------|
| [Date] | `npm run old-build` | Replaced by new build system | `npm run build:prod` |
| [Date] | `npm test -- --watch` | Watch mode not suitable for CI | `npm test -- --run` |
```
```

This comprehensive build command preservation system ensures that successful build and test commands are systematically stored, maintained, and made available for context-free execution by any AI agent, eliminating the need to rediscover working configurations and reducing development friction.
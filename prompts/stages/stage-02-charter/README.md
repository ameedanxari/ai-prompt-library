# Stage 02 - Charter

## Purpose
Define comprehensive project scope, goals, success criteria, and stakeholder requirements.

## Instructions
Use this stage to establish a clear project charter that defines scope, objectives, and success criteria. This stage transforms the initial requirements from Stage 01 into a comprehensive project definition that guides all subsequent development stages.

1. **Review Stage 01 Outputs**: Analyze requirements and asset mapping from intake stage
2. **Define Project Scope**: Establish clear boundaries and deliverables
3. **Set Success Criteria**: Define measurable objectives and acceptance criteria
4. **Analyze Stakeholders**: Identify all stakeholders and their requirements
5. **Create Platform-Specific Charters**: Develop targeted charters for each platform
6. **Validate Charter**: Ensure charter aligns with business objectives

## Examples

### E-commerce Platform Charter Example
```markdown
## Project Charter: E-commerce Platform

### Project Scope
**Objective**: Build a modern e-commerce platform supporting web and mobile customers

**Core Features**:
- Product catalog and search
- Shopping cart and checkout
- User account management
- Order tracking and history
- Admin dashboard for inventory management

**Success Criteria**:
- Support 10,000+ concurrent users
- 99.9% uptime availability
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Sub-3-second page load times

### Stakeholder Analysis
**Primary Stakeholders**:
- End Customers: Seamless shopping experience
- Business Owners: Sales growth and operational efficiency
- Administrators: Easy inventory and order management

**Technical Stakeholders**:
- Development Team: Maintainable, scalable codebase
- DevOps Team: Reliable deployment and monitoring
- QA Team: Comprehensive testing capabilities

### Platform-Specific Considerations
**Web Platform**:
- SEO optimization for product discovery
- Progressive Web App capabilities
- Cross-browser compatibility

**Mobile Platform**:
- Native app store presence
- Push notifications for order updates
- Offline browsing capabilities
```

### SaaS Application Charter Example
```markdown
## Project Charter: Task Management SaaS

### Project Definition
**Vision**: Streamline team collaboration through intuitive task management

**Scope Boundaries**:
- **Included**: Task creation, assignment, tracking, team collaboration
- **Excluded**: Time tracking, invoicing, advanced project management
- **Future Considerations**: Integration with external tools, advanced analytics

### Success Metrics
**User Adoption**:
- 1,000 active users within 6 months
- 80% user retention after 30 days
- Average session duration > 15 minutes

**Technical Performance**:
- 99.5% uptime SLA
- API response times < 200ms
- Mobile app store rating > 4.0 stars

### Risk Assessment
**High Risk**: Third-party integration dependencies
**Medium Risk**: Scalability under high user load
**Low Risk**: UI/UX acceptance by target users
```

## Inputs
- Stage 01 outputs (requirements and asset mapping)
- User preferences and constraints
- Business objectives and success metrics

## Outputs
- `platform-agnostic.md` - Project charter and scope definition
- `web.md` - Web platform charter considerations
- `mobile.md` - Mobile platform charter considerations
- Stakeholder analysis and requirements
- Success criteria and acceptance metrics

## Prerequisites
- Stage 01 (Intake) completed
- Project requirements validated

## Next Stage
Stage 03 - Architecture (System architecture design)

## Templates

This module includes the following templates:

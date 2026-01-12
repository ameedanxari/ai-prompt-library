# AI Prompt Library Troubleshooting Guide

## Purpose
Comprehensive troubleshooting guide for common issues encountered when using the AI Prompt Library system. This guide helps developers and AI agents quickly identify and resolve problems during pipeline execution.

## Common Issues and Solutions

### 1. Pipeline Execution Issues

#### Issue: Stage Prerequisites Not Met
**Symptoms:**
- Quality gate validation fails
- "Cannot proceed to next stage" errors
- Missing required outputs from previous stages

**Diagnosis:**
```bash
# Check current project state
cat NEXT_ACTION.md
cat prompts/outputs/PROJECT_STATE.md

# Verify stage outputs exist
ls -la prompts/outputs/specifications/
ls -la prompts/outputs/architecture/
```

**Solutions:**
1. **Complete Missing Prerequisites:**
   - Review NEXT_ACTION.md for required files
   - Re-execute previous stage if outputs are missing
   - Validate output completeness using quality gates

2. **Force Stage Progression (Use with caution):**
   - Update NEXT_ACTION.md manually
   - Add placeholder outputs for missing prerequisites
   - Document the bypass in DEVELOPMENT_LOG.md

**Prevention:**
- Always validate stage completion before proceeding
- Use quality gate system for prerequisite checking
- Maintain comprehensive state documentation

#### Issue: Context Token Limit Exceeded
**Symptoms:**
- "Token limit exceeded" errors
- Incomplete task generation
- Context optimization failures

**Diagnosis:**
```bash
# Check content sizes
wc -c prompts/outputs/**/*.md
grep -r "token" prompts/outputs/DEVELOPMENT_LOG.md
```

**Solutions:**
1. **Enable Context Optimization:**
   - Use ContextOptimizationService for large content
   - Enable chunking for oversized specifications
   - Remove redundant information from outputs

2. **Reduce Content Scope:**
   - Break large features into smaller components
   - Use incremental prompt generation
   - Focus on essential information only

**Prevention:**
- Monitor token usage throughout pipeline
- Use context optimization proactively
- Keep individual outputs under 2000 tokens

### 2. State Management Issues

#### Issue: Corrupted or Missing State Files
**Symptoms:**
- NEXT_ACTION.md missing or malformed
- PROJECT_STATE.md inconsistencies
- Cannot resume pipeline execution

**Diagnosis:**
```bash
# Check state file integrity
file NEXT_ACTION.md PROJECT_STATE.md
head -20 NEXT_ACTION.md
grep -E "Stage|Status" prompts/outputs/PROJECT_STATE.md
```

**Solutions:**
1. **Reconstruct State from Outputs:**
   - Use StateManager.reconstructContext()
   - Rebuild state from existing output files
   - Validate reconstructed state consistency

2. **Manual State Recovery:**
   - Create new NEXT_ACTION.md from template
   - Rebuild PROJECT_STATE.md from available outputs
   - Update DEVELOPMENT_LOG.md with recovery actions

**Recovery Template:**
```markdown
# NEXT_ACTION.md Recovery Template
## Current Status
- **Current Stage**: [Determine from outputs]
- **Status**: [IN_PROGRESS/COMPLETED]
- **Last Completed**: [Check output timestamps]

## What Happens Next
1. Validate existing outputs
2. Determine next stage based on completions
3. Resume pipeline execution

## Context Files
- [List available output files]
```

**Prevention:**
- Regular state file backups
- Use atomic state updates
- Validate state consistency after each stage

#### Issue: Agent Handoff Failures
**Symptoms:**
- New agent cannot understand project context
- Missing critical information for continuation
- Inconsistent execution across agents

**Diagnosis:**
```bash
# Check context completeness
grep -r "TODO\|FIXME\|INCOMPLETE" prompts/outputs/
cat prompts/outputs/ARCHITECTURE_DECISIONS.md
```

**Solutions:**
1. **Enhance Context Documentation:**
   - Update ARCHITECTURE_DECISIONS.md with rationale
   - Add detailed execution history to DEVELOPMENT_LOG.md
   - Include traceability links in outputs

2. **Standardize Handoff Protocol:**
   - Use DocumentationTraceabilitySystem
   - Generate comprehensive project documentation
   - Validate context completeness before handoff

**Prevention:**
- Maintain detailed decision documentation
- Use standardized output formats
- Regular context validation checks

### 3. Template and Task Generation Issues

#### Issue: Template Selection Failures
**Symptoms:**
- No templates selected for domain/stage
- Inappropriate template combinations
- Missing cross-cutting concerns

**Diagnosis:**
```bash
# Check template availability
ls -la prompts/modules/
grep -r "domain.*commerce" prompts/modules/
```

**Solutions:**
1. **Verify Template Library:**
   - Check template completeness for domain
   - Validate template metadata and tagging
   - Update template library if needed

2. **Manual Template Selection:**
   - Override automatic selection
   - Specify required templates explicitly
   - Document manual selections in decisions

**Prevention:**
- Regular template library validation
- Comprehensive domain coverage testing
- Template dependency verification

#### Issue: Context-Agnostic Task Generation Failures
**Symptoms:**
- Tasks contain hardcoded references
- Missing context information in tasks
- Tasks cannot be executed independently

**Diagnosis:**
```bash
# Check task quality
grep -r "TODO\|FIXME" prompts/outputs/tasks/
grep -r "see above\|previous" prompts/outputs/tasks/
```

**Solutions:**
1. **Regenerate Tasks with Full Context:**
   - Include all necessary context references
   - Add self-contained information blocks
   - Validate task independence

2. **Enhance Task Templates:**
   - Update task generation templates
   - Add context inclusion patterns
   - Improve task validation rules

**Prevention:**
- Use TaskGenerationEngine validation
- Regular task quality audits
- Context-agnostic testing

### 4. Performance Issues

#### Issue: Slow Pipeline Execution
**Symptoms:**
- Long stage execution times
- Memory usage growth
- File system performance degradation

**Diagnosis:**
```bash
# Monitor performance
time ls -la prompts/outputs/
du -sh prompts/outputs/
ps aux | grep node
```

**Solutions:**
1. **Optimize Content Processing:**
   - Enable context optimization
   - Use incremental processing
   - Clean up temporary files

2. **Resource Management:**
   - Monitor memory usage
   - Use streaming for large files
   - Implement garbage collection

**Prevention:**
- Regular performance monitoring
- Resource usage limits
- Efficient file organization

#### Issue: Large Output File Sizes
**Symptoms:**
- Output files exceed reasonable sizes
- File system space issues
- Slow file operations

**Solutions:**
1. **Content Optimization:**
   - Remove redundant information
   - Use compression for large outputs
   - Split large files into components

2. **Output Management:**
   - Regular cleanup of old outputs
   - Archive completed projects
   - Use efficient file formats

### 5. Integration and Deployment Issues

#### Issue: Cross-Platform Inconsistencies
**Symptoms:**
- Different behavior on different platforms
- Platform-specific template failures
- Inconsistent output formats

**Solutions:**
1. **Platform Validation:**
   - Test on all target platforms
   - Use platform-agnostic templates
   - Validate cross-platform compatibility

2. **Standardization:**
   - Use consistent file formats
   - Standardize path handling
   - Implement platform abstraction

#### Issue: Compliance Validation Failures
**Symptoms:**
- Regulatory compliance checks fail
- Security validation errors
- Audit trail inconsistencies

**Solutions:**
1. **Enhanced Compliance Checking:**
   - Use QualityGateSystem for validation
   - Implement comprehensive audit trails
   - Regular compliance reviews

2. **Documentation Enhancement:**
   - Maintain detailed compliance records
   - Document all security decisions
   - Create audit-ready documentation

## Diagnostic Tools and Commands

### State Validation
```bash
# Check pipeline state
cat NEXT_ACTION.md | head -20
grep "Stage.*COMPLETE" prompts/outputs/PROJECT_STATE.md

# Validate file integrity
find prompts/outputs -name "*.md" -exec wc -l {} \;
find prompts/outputs -name "*.md" -exec head -5 {} \;
```

### Performance Monitoring
```bash
# Monitor resource usage
du -sh prompts/outputs/*
ls -la prompts/outputs/ | wc -l
ps aux | grep -E "node|npm"
```

### Content Analysis
```bash
# Check content quality
grep -r "TODO\|FIXME\|INCOMPLETE" prompts/outputs/
grep -r "Error\|Failed\|Missing" prompts/outputs/DEVELOPMENT_LOG.md
```

### Template Validation
```bash
# Verify template availability
find prompts/modules -name "*.md" | wc -l
find prompts/stages -name "*.md" | wc -l
```

## Emergency Recovery Procedures

### Complete State Recovery
1. **Backup Current State:**
   ```bash
   cp -r prompts/outputs prompts/outputs.backup.$(date +%Y%m%d_%H%M%S)
   ```

2. **Reconstruct from Outputs:**
   - Analyze existing output files
   - Determine last completed stage
   - Rebuild state files from templates

3. **Validate Recovery:**
   - Test pipeline continuation
   - Verify output consistency
   - Document recovery process

### Pipeline Reset
1. **Preserve Critical Data:**
   - Save MY_PROJECT.md
   - Backup important outputs
   - Document current progress

2. **Clean Reset:**
   ```bash
   rm -f NEXT_ACTION.md
   rm -rf prompts/outputs/*
   ```

3. **Restart Pipeline:**
   - Begin from Stage 01
   - Use preserved project brief
   - Document reset reason

## Best Practices for Issue Prevention

### 1. Proactive Monitoring
- Regular state file validation
- Performance metrics tracking
- Quality gate compliance checking
- Resource usage monitoring

### 2. Comprehensive Documentation
- Detailed decision documentation
- Complete traceability records
- Regular documentation updates
- Standardized formats

### 3. Robust Error Handling
- Comprehensive error recovery procedures
- Graceful failure handling
- Alternative approach documentation
- Recovery validation

### 4. Regular Maintenance
- Template library updates
- Performance optimization
- Security validation
- Compliance reviews

## Getting Help

### Internal Resources
1. **Documentation System**: Use DocumentationTraceabilitySystem for project-specific help
2. **Error Recovery**: Consult ErrorRecoverySystem for automated solutions
3. **Quality Gates**: Use QualityGateSystem for validation guidance

### External Support
1. **Community Forums**: Share common issues and solutions
2. **Documentation**: Refer to comprehensive system documentation
3. **Issue Tracking**: Report bugs and feature requests

### Emergency Contacts
- **System Administrator**: For critical system failures
- **Technical Lead**: For architectural decisions
- **Compliance Officer**: For regulatory issues

## Conclusion

This troubleshooting guide provides comprehensive solutions for common issues in the AI Prompt Library system. Regular reference to this guide and proactive issue prevention will ensure smooth pipeline execution and high-quality outputs.

For issues not covered in this guide, use the diagnostic tools provided and follow the emergency recovery procedures. Always document new issues and solutions to improve this guide for future users.
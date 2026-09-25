### Example 2: Advanced Environment Promotion Pipeline
```yaml
# .github/workflows/gitops-promotion-pipeline.yml
name: GitOps Advanced Promotion Pipeline

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

env:
  GITOPS_ORCHESTRATION: enabled
  AI_OPTIMIZATION: enabled
  SECURITY_SCANNING: comprehensive

jobs:
  analyze-changes:
    runs-on: ubuntu-latest
    outputs:
      deployment-plan: ${{ steps.analysis.outputs.deployment-plan }}
      risk-score: ${{ steps.analysis.outputs.risk-score }}
      environments: ${{ steps.analysis.outputs.environments }}
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup GitOps Tools
        run: |
          # Install GitOps and analysis tools
          curl -sSL https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 -o argocd
          chmod +x argocd && sudo mv argocd /usr/local/bin/
          
          # Install Flux CLI
          # SECURITY: piping a URL into a sudo shell runs unreviewed code as root — download the script, inspect it, then run it with least privilege.
          curl -s https://fluxcd.io/install.sh | sudo bash
          
          # Install security scanning tools
          # SECURITY: piping a URL straight into a shell runs unreviewed code — download the script, inspect it, then run it.
          curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
          
      - name: Analyze Repository Changes
        id: analysis
        run: |
          # Analyze Git changes and impact
          node scripts/analyze-repository-changes.js \
            --base-branch ${{ github.event.before }} \
            --target-branch ${{ github.sha }} \
            --output-format json > change-analysis.json
          
          # Generate AI-optimized deployment plan
          node scripts/generate-deployment-plan.js \
            --changes change-analysis.json \
            --optimization ai-driven \
            --output deployment-plan.json
          
          # Calculate risk score and determine environments
          RISK_SCORE=$(jq -r '.riskScore' deployment-plan.json)
          ENVIRONMENTS=$(jq -r '.targetEnvironments | join(",")' deployment-plan.json)
          
          echo "deployment-plan=$(cat deployment-plan.json | jq -c .)" >> $GITHUB_OUTPUT
          echo "risk-score=$RISK_SCORE" >> $GITHUB_OUTPUT
          echo "environments=$ENVIRONMENTS" >> $GITHUB_OUTPUT
      
      - name: Security and Compliance Scanning
        run: |
          # Scan for security vulnerabilities
          grype . -o json > security-scan.json
          
          # Compliance validation
          node scripts/validate-compliance.js \
            --policies policies/security-policies.json \
            --scan-results security-scan.json
          
      - name: Upload Analysis Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: gitops-analysis
          path: |
            change-analysis.json
            deployment-plan.json
            security-scan.json

  development-deployment:
    needs: analyze-changes
    if: contains(fromJson(needs.analyze-changes.outputs.environments), 'development')
    runs-on: ubuntu-latest
    environment: development
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download Analysis Artifacts
        uses: actions/download-artifact@v3
        with:
          name: gitops-analysis
      
      - name: Deploy to Development
        run: |
          # Configure ArgoCD for development deployment
          argocd login ${{ secrets.ARGOCD_SERVER }} \
            --username ${{ secrets.ARGOCD_USERNAME }} \
            --password ${{ secrets.ARGOCD_PASSWORD }}
          
          # Apply GitOps deployment with intelligent strategies
          node scripts/deploy-with-gitops.js \
            --environment development \
            --deployment-plan deployment-plan.json \
            --strategy intelligent \
            --monitoring comprehensive
          
      - name: Validate Development Deployment
        run: |
          # Comprehensive deployment validation
          node scripts/validate-deployment.js \
            --environment development \
            --validation-suite comprehensive \
            --timeout 600
          
          # Performance and health checks
          node scripts/run-health-checks.js \
            --environment development \
            --checks performance,security,functionality

  staging-promotion:
    needs: [analyze-changes, development-deployment]
    if: |
      contains(fromJson(needs.analyze-changes.outputs.environments), 'staging') &&
      needs.analyze-changes.outputs.risk-score < '7.0'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download Analysis Artifacts
        uses: actions/download-artifact@v3
        with:
          name: gitops-analysis
      
      - name: Intelligent Promotion to Staging
        run: |
          # Configure promotion gates and validation
          node scripts/configure-promotion-gates.js \
            --source-environment development \
            --target-environment staging \
            --validation-criteria strict
          
          # Execute intelligent promotion
          node scripts/promote-with-intelligence.js \
            --environment staging \
            --deployment-plan deployment-plan.json \
            --strategy canary \
            --rollback-preparation enabled
          
      - name: Staging Validation and Testing
        run: |
          # Comprehensive staging validation
          node scripts/validate-staging-deployment.js \
            --validation-suite comprehensive \
            --performance-tests enabled \
            --security-tests enabled
          
          # Load testing and performance validation
          node scripts/run-load-tests.js \
            --environment staging \
            --duration 300 \
            --concurrent-users 100

  production-promotion:
    needs: [analyze-changes, staging-promotion]
    if: |
      contains(fromJson(needs.analyze-changes.outputs.environments), 'production') &&
      needs.analyze-changes.outputs.risk-score < '5.0' &&
      github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download Analysis Artifacts
        uses: actions/download-artifact@v3
        with:
          name: gitops-analysis
      
      - name: Production Deployment with Advanced Strategies
        run: |
          # Configure advanced production deployment
          node scripts/configure-production-deployment.js \
            --strategy blue-green \
            --rollback-automation enabled \
            --monitoring comprehensive \
            --alerting intelligent
          
          # Execute production deployment with AI optimization
          node scripts/deploy-to-production.js \
            --deployment-plan deployment-plan.json \
            --optimization ai-driven \
            --safety-checks comprehensive \
            --rollback-preparation automatic
          
      - name: Production Validation and Monitoring
        run: |
          # Comprehensive production validation
          node scripts/validate-production-deployment.js \
            --validation-suite production \
            --monitoring real-time \
            --alerting enabled
          
          # Configure intelligent monitoring and alerting
          node scripts/configure-intelligent-monitoring.js \
            --environment production \
            --ai-driven-alerts enabled \
            --predictive-monitoring enabled

  rollback-preparation:
    needs: [analyze-changes, production-promotion]
    if: always()
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Prepare Intelligent Rollback
        run: |
          # Analyze deployment state and prepare rollback strategies
          node scripts/prepare-intelligent-rollback.js \
            --deployment-plan deployment-plan.json \
            --current-state production \
            --rollback-strategies comprehensive
          
          # Configure automated rollback triggers
          node scripts/configure-rollback-triggers.js \
            --environment production \
            --triggers intelligent \
            --automation enabled
          
      - name: Validate Rollback Readiness
        run: |
          # Test rollback procedures and validate readiness
          node scripts/validate-rollback-readiness.js \
            --environment production \
            --rollback-test dry-run \
            --validation comprehensive

# Stage 09 - Quality Assurance (Web Applications)

## Purpose
This stage implements web-specific quality assurance procedures, focusing on browser compatibility, web performance, accessibility, and modern web standards compliance. It ensures web applications meet performance benchmarks, accessibility standards, and work consistently across different browsers and devices while following progressive web app best practices.

## Instructions

### When to Use This Stage
- Developing web applications that need cross-browser compatibility
- Implementing Progressive Web App (PWA) features and compliance
- Ensuring web accessibility compliance (WCAG 2.1 AA)
- Optimizing web performance and Core Web Vitals
- Preparing web applications for production deployment

### Implementation Steps
1. **Set Up Cross-Browser Testing**: Configure automated testing across supported browsers and devices
2. **Implement Performance Monitoring**: Set up Core Web Vitals tracking and performance benchmarks
3. **Configure Accessibility Testing**: Implement automated and manual accessibility validation
4. **Set Up PWA Compliance**: Ensure service worker, manifest, and PWA requirements are met
5. **Establish SEO Standards**: Implement SEO best practices and validation procedures

### Key Configuration Decisions
- **Browser Support Matrix**: Define which browsers and versions to support based on user analytics
- **Performance Thresholds**: Set appropriate Core Web Vitals targets (LCP <2.5s, FID <100ms, CLS <0.1)
- **Accessibility Level**: Choose WCAG compliance level (AA recommended, AAA for high-accessibility needs)
- **PWA Features**: Decide which PWA features to implement (offline support, push notifications, etc.)

### Web Quality Approach
- **Progressive Enhancement**: Build core functionality first, then enhance for modern browsers
- **Performance Budget**: Set and enforce performance budgets for bundle sizes and loading times
- **Accessibility First**: Integrate accessibility testing throughout the development process
- **Real User Monitoring**: Use RUM data to validate synthetic testing results

## Examples

## Examples

### 1. Comprehensive Cross-Browser Testing Framework
```typescript
// cross-browser-testing.ts - Automated browser compatibility testing
export class CrossBrowserTestingFramework {
  private browserMatrix = {
    desktop: [
      { name: 'Chrome', versions: ['latest', 'latest-1'], market_share: 65 },
      { name: 'Firefox', versions: ['latest', 'latest-1'], market_share: 8 },
      { name: 'Safari', versions: ['latest', 'latest-1'], market_share: 19 },
      { name: 'Edge', versions: ['latest', 'latest-1'], market_share: 5 }
    ],
    mobile: [
      { name: 'Chrome Mobile', versions: ['latest', 'latest-1'], market_share: 45 },
      { name: 'Safari Mobile', versions: ['latest', 'latest-1'], market_share: 35 },
      { name: 'Samsung Internet', versions: ['latest'], market_share: 8 }
    ]
  };
  
  async runCrossBrowserTests(): Promise<BrowserTestResults> {
    const results: BrowserTestResults = {
      passed: [],
      failed: [],
      warnings: []
    };
    
    // Test desktop browsers
    for (const browser of this.browserMatrix.desktop) {
      for (const version of browser.versions) {
        try {
          const testResult = await this.testBrowser(browser.name, version, 'desktop');
          if (testResult.success) {
            results.passed.push(testResult);
          } else {
            results.failed.push(testResult);
          }
        } catch (error) {
          results.failed.push({
            browser: `${browser.name} ${version}`,
            platform: 'desktop',
            error: error.message,
            success: false
          });
        }
      }
    }
    
    // Test mobile browsers
    for (const browser of this.browserMatrix.mobile) {
      for (const version of browser.versions) {
        try {
          const testResult = await this.testBrowser(browser.name, version, 'mobile');
          if (testResult.success) {
            results.passed.push(testResult);
          } else {
            results.failed.push(testResult);
          }
        } catch (error) {
          results.failed.push({
            browser: `${browser.name} ${version}`,
            platform: 'mobile',
            error: error.message,
            success: false
          });
        }
      }
    }
    
    return results;
  }
  
  private async testBrowser(
    browserName: string, 
    version: string, 
    platform: string
  ): Promise<BrowserTestResult> {
    const browser = await this.launchBrowser(browserName, version, platform);
    
    try {
      const tests = [
        () => this.testPageLoad(browser),
        () => this.testInteractiveElements(browser),
        () => this.testResponsiveDesign(browser),
        () => this.testJavaScriptFeatures(browser),
        () => this.testCSSFeatures(browser),
        () => this.testFormFunctionality(browser),
        () => this.testMediaPlayback(browser)
      ];
      
      const testResults = await Promise.all(
        tests.map(test => test().catch(error => ({ success: false, error })))
      );
      
      const failedTests = testResults.filter(result => !result.success);
      
      return {
        browser: `${browserName} ${version}`,
        platform,
        success: failedTests.length === 0,
        testResults,
        screenshots: await this.captureScreenshots(browser),
        performanceMetrics: await this.measurePerformance(browser)
      };
    } finally {
      await browser.close();
    }
  }
  
  async generateCompatibilityReport(): Promise<CompatibilityReport> {
    const results = await this.runCrossBrowserTests();
    
    const totalTests = results.passed.length + results.failed.length;
    const compatibilityRate = (results.passed.length / totalTests) * 100;
    
    // Calculate market coverage
    const marketCoverage = this.calculateMarketCoverage(results.passed);
    
    return {
      timestamp: new Date(),
      compatibilityRate,
      marketCoverage,
      totalBrowsers: totalTests,
      passedBrowsers: results.passed.length,
      failedBrowsers: results.failed.length,
      criticalFailures: results.failed.filter(r => 
        this.isCriticalBrowser(r.browser)
      ),
      recommendations: this.generateCompatibilityRecommendations(results)
    };
  }
}

// Usage in CI/CD pipeline
const browserTesting = new CrossBrowserTestingFramework();
const compatibilityReport = await browserTesting.generateCompatibilityReport();

if (compatibilityReport.criticalFailures.length > 0) {
  console.error('Critical browser compatibility failures detected');
  process.exit(1);
}

if (compatibilityReport.marketCoverage < 90) {
  console.warn(`Market coverage is ${compatibilityReport.marketCoverage}%, below 90% target`);
}
```

### 2. Core Web Vitals Performance Monitoring
```typescript
// web-vitals-monitor.ts - Comprehensive web performance tracking
export class WebVitalsMonitor {
  private performanceThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
    fid: { good: 100, needsImprovement: 300 },   // First Input Delay
    cls: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
    fcp: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
    ttfb: { good: 800, needsImprovement: 1800 }  // Time to First Byte
  };
  
  async measureCoreWebVitals(): Promise<WebVitalsMetrics> {
    const metrics = await Promise.all([
      this.measureLCP(),
      this.measureFID(),
      this.measureCLS(),
      this.measureFCP(),
      this.measureTTFB()
    ]);
    
    return {
      lcp: metrics[0],
      fid: metrics[1],
      cls: metrics[2],
      fcp: metrics[3],
      ttfb: metrics[4],
      overallScore: this.calculateOverallScore(metrics),
      recommendations: this.generatePerformanceRecommendations(metrics)
    };
  }
  
  private async measureLCP(): Promise<PerformanceMetric> {
    const lcpValue = await this.getLCPValue();
    
    return {
      name: 'Largest Contentful Paint',
      value: lcpValue,
      unit: 'ms',
      rating: this.getRating(lcpValue, this.performanceThresholds.lcp),
      target: this.performanceThresholds.lcp.good,
      passed: lcpValue <= this.performanceThresholds.lcp.good
    };
  }
  
  async setupRealUserMonitoring(): Promise<void> {
    // Set up Web Vitals collection in the browser
    const webVitalsScript = `
      import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      
      function sendToAnalytics(metric) {
        // Send to your analytics service
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta,
            rating: metric.rating,
            navigationType: metric.navigationType,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          })
        });
      }
      
      // Collect all Core Web Vitals
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    `;
    
    await this.injectScript(webVitalsScript);
  }
  
  async generatePerformanceReport(): Promise<PerformanceReport> {
    const webVitals = await this.measureCoreWebVitals();
    const resourceMetrics = await this.analyzeResourcePerformance();
    const networkMetrics = await this.analyzeNetworkPerformance();
    
    return {
      timestamp: new Date(),
      webVitals,
      resources: resourceMetrics,
      network: networkMetrics,
      overallGrade: this.calculatePerformanceGrade(webVitals),
      optimizationOpportunities: this.identifyOptimizationOpportunities({
        webVitals,
        resources: resourceMetrics,
        network: networkMetrics
      }),
      budgetStatus: await this.checkPerformanceBudget()
    };
  }
  
  private identifyOptimizationOpportunities(metrics: any): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];
    
    // LCP optimization opportunities
    if (metrics.webVitals.lcp.value > this.performanceThresholds.lcp.good) {
      opportunities.push({
        metric: 'LCP',
        impact: 'high',
        effort: 'medium',
        title: 'Optimize Largest Contentful Paint',
        description: 'LCP is slower than recommended. Consider optimizing images, fonts, or server response time.',
        actions: [
          'Optimize and compress hero images',
          'Preload critical resources',
          'Improve server response time',
          'Use CDN for static assets'
        ],
        estimatedImprovement: '1.2s'
      });
    }
    
    // CLS optimization opportunities
    if (metrics.webVitals.cls.value > this.performanceThresholds.cls.good) {
      opportunities.push({
        metric: 'CLS',
        impact: 'high',
        effort: 'low',
        title: 'Reduce Cumulative Layout Shift',
        description: 'Layout shifts detected. Reserve space for dynamic content.',
        actions: [
          'Set explicit dimensions for images and videos',
          'Reserve space for ads and embeds',
          'Avoid inserting content above existing content',
          'Use CSS aspect-ratio for responsive media'
        ],
        estimatedImprovement: '0.05 CLS score'
      });
    }
    
    return opportunities.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 };
      
      const scoreA = impactScore[a.impact] + effortScore[a.effort];
      const scoreB = impactScore[b.impact] + effortScore[b.effort];
      
      return scoreB - scoreA;
    });
  }
}

// Continuous performance monitoring
const webVitalsMonitor = new WebVitalsMonitor();

// Set up real user monitoring
await webVitalsMonitor.setupRealUserMonitoring();

// Generate performance reports
const performanceReport = await webVitalsMonitor.generatePerformanceReport();

// Alert if performance degrades
if (performanceReport.overallGrade < 'B') {
  await alertPerformanceTeam('Web performance degradation detected', performanceReport);
}
```

### 3. Comprehensive Web Accessibility Testing
```typescript
// web-accessibility-tester.ts - WCAG 2.1 AA compliance testing
export class WebAccessibilityTester {
  private wcagLevels = ['A', 'AA', 'AAA'];
  private targetLevel = 'AA';
  
  async runAutomatedAccessibilityTests(): Promise<AccessibilityTestResults> {
    const axeResults = await this.runAxeTests();
    const lighthouseResults = await this.runLighthouseA11yAudit();
    const waveResults = await this.runWaveTests();
    
    return {
      axe: axeResults,
      lighthouse: lighthouseResults,
      wave: waveResults,
      overallScore: this.calculateOverallA11yScore([
        axeResults, lighthouseResults, waveResults
      ]),
      criticalIssues: this.extractCriticalIssues([
        axeResults, lighthouseResults, waveResults
      ])
    };
  }
  
  private async runAxeTests(): Promise<AxeTestResults> {
    const axeConfig = {
      rules: {
        // Enable all WCAG 2.1 AA rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        'aria-usage': { enabled: true },
        'semantic-structure': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    };
    
    const results = await this.runAxeCore(axeConfig);
    
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      score: this.calculateAxeScore(results),
      wcagLevel: this.determineWCAGLevel(results.violations)
    };
  }
  
  async runManualAccessibilityTests(): Promise<ManualA11yTestResults> {
    const manualTests = [
      {
        name: 'Keyboard Navigation',
        test: () => this.testKeyboardNavigation(),
        wcagCriteria: ['2.1.1', '2.1.2', '2.4.3']
      },
      {
        name: 'Screen Reader Compatibility',
        test: () => this.testScreenReaderCompatibility(),
        wcagCriteria: ['1.3.1', '2.4.6', '4.1.2']
      },
      {
        name: 'Color and Contrast',
        test: () => this.testColorAndContrast(),
        wcagCriteria: ['1.4.3', '1.4.11']
      },
      {
        name: 'Text Scaling',
        test: () => this.testTextScaling(),
        wcagCriteria: ['1.4.4', '1.4.10']
      },
      {
        name: 'Motion and Animation',
        test: () => this.testMotionAndAnimation(),
        wcagCriteria: ['2.2.2', '2.3.3']
      }
    ];
    
    const results = await Promise.all(
      manualTests.map(async test => ({
        name: test.name,
        result: await test.test(),
        wcagCriteria: test.wcagCriteria
      }))
    );
    
    return {
      tests: results,
      passed: results.every(r => r.result.passed),
      score: (results.filter(r => r.result.passed).length / results.length) * 100
    };
  }
  
  private async testKeyboardNavigation(): Promise<TestResult> {
    const issues: string[] = [];
    
    // Test tab order
    const tabOrder = await this.getTabOrder();
    if (!this.isLogicalTabOrder(tabOrder)) {
      issues.push('Tab order is not logical or intuitive');
    }
    
    // Test focus visibility
    const focusVisibility = await this.testFocusVisibility();
    if (!focusVisibility.allVisible) {
      issues.push(`${focusVisibility.hiddenCount} elements lack visible focus indicators`);
    }
    
    // Test keyboard traps
    const keyboardTraps = await this.detectKeyboardTraps();
    if (keyboardTraps.length > 0) {
      issues.push(`Keyboard traps detected: ${keyboardTraps.join(', ')}`);
    }
    
    // Test skip links
    const skipLinks = await this.validateSkipLinks();
    if (!skipLinks.present) {
      issues.push('Skip navigation links are missing');
    }
    
    return {
      passed: issues.length === 0,
      issues,
      recommendations: issues.map(issue => ({
        issue,
        solution: this.getKeyboardNavigationSolution(issue)
      }))
    };
  }
  
  async generateAccessibilityReport(): Promise<AccessibilityReport> {
    const automatedResults = await this.runAutomatedAccessibilityTests();
    const manualResults = await this.runManualAccessibilityTests();
    const complianceLevel = this.determineComplianceLevel(automatedResults, manualResults);
    
    return {
      timestamp: new Date(),
      complianceLevel,
      targetLevel: this.targetLevel,
      compliant: complianceLevel >= this.targetLevel,
      automated: automatedResults,
      manual: manualResults,
      overallScore: (automatedResults.overallScore + manualResults.score) / 2,
      criticalIssues: [
        ...automatedResults.criticalIssues,
        ...this.extractManualCriticalIssues(manualResults)
      ],
      recommendations: this.generateA11yRecommendations(automatedResults, manualResults),
      remediationPlan: this.createRemediationPlan(automatedResults, manualResults)
    };
  }
  
  private createRemediationPlan(
    automated: AccessibilityTestResults,
    manual: ManualA11yTestResults
  ): RemediationPlan {
    const allIssues = [
      ...automated.criticalIssues,
      ...this.extractManualCriticalIssues(manual)
    ];
    
    // Prioritize issues by impact and effort
    const prioritizedIssues = allIssues.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 };
      
      const scoreA = impactScore[a.impact] + effortScore[a.effort];
      const scoreB = impactScore[b.impact] + effortScore[b.effort];
      
      return scoreB - scoreA;
    });
    
    return {
      phases: [
        {
          name: 'Critical Issues (Week 1)',
          issues: prioritizedIssues.slice(0, 5),
          estimatedEffort: '1 week',
          expectedImpact: 'High'
        },
        {
          name: 'High Priority Issues (Week 2-3)',
          issues: prioritizedIssues.slice(5, 15),
          estimatedEffort: '2 weeks',
          expectedImpact: 'Medium-High'
        },
        {
          name: 'Remaining Issues (Week 4+)',
          issues: prioritizedIssues.slice(15),
          estimatedEffort: '2+ weeks',
          expectedImpact: 'Medium'
        }
      ],
      totalEstimatedEffort: '5+ weeks',
      expectedComplianceLevel: 'AA'
    };
  }
}

// Accessibility testing in CI/CD
const a11yTester = new WebAccessibilityTester();
const a11yReport = await a11yTester.generateAccessibilityReport();

if (!a11yReport.compliant) {
  console.error('Accessibility compliance issues detected:');
  a11yReport.criticalIssues.forEach(issue => {
    console.error(`- ${issue.title}: ${issue.description}`);
  });
  
  // Fail build if critical accessibility issues
  const criticalCount = a11yReport.criticalIssues.filter(i => i.impact === 'high').length;
  if (criticalCount > 0) {
    process.exit(1);
  }
}
```

### 4. Progressive Web App (PWA) Compliance Validation
```typescript
// pwa-validator.ts - PWA compliance and feature validation
export class PWAValidator {
  private pwaRequirements = {
    core: [
      'service-worker',
      'web-app-manifest',
      'https',
      'responsive-design',
      'fast-loading'
    ],
    enhanced: [
      'offline-functionality',
      'push-notifications',
      'background-sync',
      'add-to-homescreen',
      'app-shell-architecture'
    ]
  };
  
  async validatePWACompliance(): Promise<PWAComplianceResult> {
    const coreResults = await this.validateCoreRequirements();
    const enhancedResults = await this.validateEnhancedFeatures();
    const lighthousePWAScore = await this.getLighthousePWAScore();
    
    return {
      coreCompliant: coreResults.every(r => r.passed),
      enhancedScore: (enhancedResults.filter(r => r.passed).length / enhancedResults.length) * 100,
      lighthouseScore: lighthousePWAScore,
      overallScore: this.calculatePWAScore(coreResults, enhancedResults, lighthousePWAScore),
      coreResults,
      enhancedResults,
      recommendations: this.generatePWARecommendations(coreResults, enhancedResults)
    };
  }
  
  private async validateCoreRequirements(): Promise<PWARequirementResult[]> {
    return await Promise.all([
      this.validateServiceWorker(),
      this.validateWebAppManifest(),
      this.validateHTTPS(),
      this.validateResponsiveDesign(),
      this.validateFastLoading()
    ]);
  }
  
  private async validateServiceWorker(): Promise<PWARequirementResult> {
    const hasServiceWorker = await this.checkServiceWorkerRegistration();
    const swFunctionality = await this.testServiceWorkerFunctionality();
    
    return {
      name: 'Service Worker',
      passed: hasServiceWorker && swFunctionality.caching && swFunctionality.offline,
      details: {
        registered: hasServiceWorker,
        cachingStrategy: swFunctionality.caching,
        offlineSupport: swFunctionality.offline,
        backgroundSync: swFunctionality.backgroundSync
      },
      recommendations: !hasServiceWorker ? [
        'Implement service worker for caching and offline functionality',
        'Add cache strategies for different resource types',
        'Implement background sync for offline actions'
      ] : []
    };
  }
  
  private async validateWebAppManifest(): Promise<PWARequirementResult> {
    const manifest = await this.getWebAppManifest();
    const manifestValid = this.validateManifestStructure(manifest);
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    return {
      name: 'Web App Manifest',
      passed: manifestValid && missingFields.length === 0,
      details: {
        present: !!manifest,
        validStructure: manifestValid,
        missingFields,
        iconSizes: manifest.icons?.map(icon => icon.sizes) || [],
        displayMode: manifest.display
      },
      recommendations: missingFields.length > 0 ? [
        `Add missing manifest fields: ${missingFields.join(', ')}`,
        'Ensure icons include 192x192 and 512x512 sizes',
        'Set appropriate display mode (standalone recommended)'
      ] : []
    };
  }
  
  async validateOfflineFunctionality(): Promise<OfflineFunctionalityResult> {
    const offlineTests = [
      {
        name: 'Core Pages Available Offline',
        test: () => this.testOfflinePageAccess()
      },
      {
        name: 'Offline Fallback Page',
        test: () => this.testOfflineFallbackPage()
      },
      {
        name: 'Cached Resources',
        test: () => this.testCachedResources()
      },
      {
        name: 'Offline Data Persistence',
        test: () => this.testOfflineDataPersistence()
      }
    ];
    
    const results = await Promise.all(
      offlineTests.map(async test => ({
        name: test.name,
        result: await test.test()
      }))
    );
    
    return {
      tests: results,
      passed: results.every(r => r.result.passed),
      score: (results.filter(r => r.result.passed).length / results.length) * 100,
      offlineCapabilities: await this.analyzeOfflineCapabilities()
    };
  }
  
  async generatePWAReport(): Promise<PWAReport> {
    const complianceResults = await this.validatePWACompliance();
    const offlineResults = await this.validateOfflineFunctionality();
    const performanceResults = await this.validatePWAPerformance();
    
    return {
      timestamp: new Date(),
      compliance: complianceResults,
      offline: offlineResults,
      performance: performanceResults,
      overallGrade: this.calculatePWAGrade(complianceResults, offlineResults, performanceResults),
      installability: await this.testInstallability(),
      recommendations: this.generateComprehensivePWARecommendations({
        compliance: complianceResults,
        offline: offlineResults,
        performance: performanceResults
      })
    };
  }
  
  private generateComprehensivePWARecommendations(results: any): PWARecommendation[] {
    const recommendations: PWARecommendation[] = [];
    
    // Core compliance recommendations
    if (!results.compliance.coreCompliant) {
      recommendations.push({
        priority: 'high',
        category: 'core',
        title: 'Fix Core PWA Requirements',
        description: 'Address missing core PWA requirements to enable basic PWA functionality',
        actions: results.compliance.coreResults
          .filter(r => !r.passed)
          .flatMap(r => r.recommendations)
      });
    }
    
    // Offline functionality recommendations
    if (results.offline.score < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'offline',
        title: 'Improve Offline Functionality',
        description: 'Enhance offline capabilities to provide better user experience',
        actions: [
          'Implement comprehensive caching strategy',
          'Add offline fallback pages',
          'Enable offline data synchronization',
          'Provide offline status indicators'
        ]
      });
    }
    
    // Performance recommendations
    if (results.performance.score < 90) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Optimize PWA Performance',
        description: 'Improve loading performance and user experience',
        actions: [
          'Implement app shell architecture',
          'Optimize critical resource loading',
          'Add loading states and skeleton screens',
          'Minimize JavaScript bundle size'
        ]
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// PWA validation in deployment pipeline
const pwaValidator = new PWAValidator();
const pwaReport = await pwaValidator.generatePWAReport();

if (!pwaReport.compliance.coreCompliant) {
  console.error('PWA core requirements not met');
  process.exit(1);
}

if (pwaReport.overallGrade < 'B') {
  console.warn(`PWA quality grade is ${pwaReport.overallGrade}, consider improvements`);
}

console.log(`PWA Compliance Score: ${pwaReport.compliance.overallScore}/100`);
```

### 5. SEO and Web Standards Validation
```typescript
// seo-validator.ts - SEO and web standards compliance
export class SEOValidator {
  private seoRequirements = {
    technical: [
      'meta-tags',
      'structured-data',
      'sitemap',
      'robots-txt',
      'canonical-urls'
    ],
    content: [
      'title-optimization',
      'heading-structure',
      'alt-text',
      'internal-linking',
      'content-quality'
    ],
    performance: [
      'page-speed',
      'mobile-friendly',
      'core-web-vitals',
      'https',
      'crawlability'
    ]
  };
  
  async validateTechnicalSEO(): Promise<TechnicalSEOResult> {
    const checks = await Promise.all([
      this.validateMetaTags(),
      this.validateStructuredData(),
      this.validateSitemap(),
      this.validateRobotsTxt(),
      this.validateCanonicalUrls()
    ]);
    
    return {
      checks,
      passed: checks.every(check => check.passed),
      score: (checks.filter(check => check.passed).length / checks.length) * 100,
      criticalIssues: checks.filter(check => !check.passed && check.critical)
    };
  }
  
  private async validateMetaTags(): Promise<SEOCheck> {
    const pages = await this.getAllPages();
    const issues: string[] = [];
    
    for (const page of pages) {
      const metaTags = await this.getPageMetaTags(page.url);
      
      // Check title tag
      if (!metaTags.title || metaTags.title.length === 0) {
        issues.push(`Missing title tag on ${page.url}`);
      } else if (metaTags.title.length > 60) {
        issues.push(`Title too long (${metaTags.title.length} chars) on ${page.url}`);
      }
      
      // Check meta description
      if (!metaTags.description || metaTags.description.length === 0) {
        issues.push(`Missing meta description on ${page.url}`);
      } else if (metaTags.description.length > 160) {
        issues.push(`Meta description too long (${metaTags.description.length} chars) on ${page.url}`);
      }
      
      // Check Open Graph tags
      if (!metaTags.ogTitle || !metaTags.ogDescription || !metaTags.ogImage) {
        issues.push(`Missing Open Graph tags on ${page.url}`);
      }
      
      // Check Twitter Card tags
      if (!metaTags.twitterCard || !metaTags.twitterTitle) {
        issues.push(`Missing Twitter Card tags on ${page.url}`);
      }
    }
    
    return {
      name: 'Meta Tags',
      passed: issues.length === 0,
      critical: true,
      issues,
      recommendations: issues.map(issue => ({
        issue,
        solution: this.getMetaTagSolution(issue)
      }))
    };
  }
  
  async validateContentSEO(): Promise<ContentSEOResult> {
    const checks = await Promise.all([
      this.validateHeadingStructure(),
      this.validateAltText(),
      this.validateInternalLinking(),
      this.validateContentQuality(),
      this.validateKeywordOptimization()
    ]);
    
    return {
      checks,
      passed: checks.every(check => check.passed),
      score: (checks.filter(check => check.passed).length / checks.length) * 100,
      contentIssues: checks.filter(check => !check.passed)
    };
  }
  
  private async validateHeadingStructure(): Promise<SEOCheck> {
    const pages = await this.getAllPages();
    const issues: string[] = [];
    
    for (const page of pages) {
      const headings = await this.getPageHeadings(page.url);
      
      // Check for H1
      const h1Count = headings.filter(h => h.level === 1).length;
      if (h1Count === 0) {
        issues.push(`Missing H1 tag on ${page.url}`);
      } else if (h1Count > 1) {
        issues.push(`Multiple H1 tags (${h1Count}) on ${page.url}`);
      }
      
      // Check heading hierarchy
      const hierarchyIssues = this.validateHeadingHierarchy(headings);
      if (hierarchyIssues.length > 0) {
        issues.push(`Heading hierarchy issues on ${page.url}: ${hierarchyIssues.join(', ')}`);
      }
      
      // Check heading content
      const emptyHeadings = headings.filter(h => !h.text || h.text.trim().length === 0);
      if (emptyHeadings.length > 0) {
        issues.push(`Empty headings found on ${page.url}`);
      }
    }
    
    return {
      name: 'Heading Structure',
      passed: issues.length === 0,
      critical: false,
      issues,
      recommendations: issues.map(issue => ({
        issue,
        solution: this.getHeadingSolution(issue)
      }))
    };
  }
  
  async generateSEOReport(): Promise<SEOReport> {
    const technicalResults = await this.validateTechnicalSEO();
    const contentResults = await this.validateContentSEO();
    const performanceResults = await this.validateSEOPerformance();
    const mobileFriendliness = await this.validateMobileFriendliness();
    
    const overallScore = (
      technicalResults.score * 0.4 +
      contentResults.score * 0.3 +
      performanceResults.score * 0.2 +
      mobileFriendliness.score * 0.1
    );
    
    return {
      timestamp: new Date(),
      overallScore,
      grade: this.calculateSEOGrade(overallScore),
      technical: technicalResults,
      content: contentResults,
      performance: performanceResults,
      mobileFriendliness,
      criticalIssues: [
        ...technicalResults.criticalIssues,
        ...contentResults.contentIssues.filter(issue => issue.critical)
      ],
      recommendations: this.generateSEORecommendations({
        technical: technicalResults,
        content: contentResults,
        performance: performanceResults,
        mobile: mobileFriendliness
      }),
      competitorAnalysis: await this.performCompetitorAnalysis()
    };
  }
  
  private generateSEORecommendations(results: any): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];
    
    // Technical SEO recommendations
    if (results.technical.score < 90) {
      recommendations.push({
        priority: 'high',
        category: 'technical',
        title: 'Fix Technical SEO Issues',
        description: 'Address technical SEO problems that may impact search visibility',
        actions: results.technical.criticalIssues.flatMap(issue => issue.recommendations),
        estimatedImpact: 'High',
        timeframe: '1-2 weeks'
      });
    }
    
    // Content SEO recommendations
    if (results.content.score < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'content',
        title: 'Improve Content SEO',
        description: 'Optimize content structure and quality for better search performance',
        actions: [
          'Optimize title tags and meta descriptions',
          'Improve heading structure and hierarchy',
          'Add alt text to all images',
          'Enhance internal linking strategy'
        ],
        estimatedImpact: 'Medium',
        timeframe: '2-3 weeks'
      });
    }
    
    // Performance SEO recommendations
    if (results.performance.score < 85) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Optimize Page Performance',
        description: 'Improve page loading speed and Core Web Vitals for better rankings',
        actions: [
          'Optimize images and implement lazy loading',
          'Minimize and compress JavaScript and CSS',
          'Implement efficient caching strategies',
          'Optimize server response times'
        ],
        estimatedImpact: 'High',
        timeframe: '1-2 weeks'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// SEO validation in content deployment
const seoValidator = new SEOValidator();
const seoReport = await seoValidator.generateSEOReport();

if (seoReport.criticalIssues.length > 0) {
  console.error('Critical SEO issues detected:');
  seoReport.criticalIssues.forEach(issue => {
    console.error(`- ${issue.name}: ${issue.issues.join(', ')}`);
  });
}

if (seoReport.overallScore < 80) {
  console.warn(`SEO score is ${seoReport.overallScore}/100, consider improvements`);
}

console.log(`SEO Grade: ${seoReport.grade}`);
```

## Overview

## Web-Specific Quality Framework

### 1. Browser Compatibility Standards

#### Cross-Browser Testing Matrix
```markdown
## Supported Browsers and Versions

### Desktop Browsers
- **Chrome**: Latest 2 versions (95%+ market share coverage)
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions (macOS)
- **Edge**: Latest 2 versions
- **Internet Explorer**: IE11 (if required by business needs)

### Mobile Browsers
- **Chrome Mobile**: Latest 2 versions (Android)
- **Safari Mobile**: Latest 2 versions (iOS)
- **Samsung Internet**: Latest version
- **Firefox Mobile**: Latest version

### Testing Requirements
- [ ] Visual consistency across all supported browsers
- [ ] Functional compatibility for all features
- [ ] Performance benchmarks met on all platforms
- [ ] Responsive design works on all screen sizes
- [ ] Touch interactions work properly on mobile devices
```

#### Browser Testing Automation
```javascript
// Example Playwright cross-browser testing configuration
const { test, expect } = require('@playwright/test');

test.describe('Cross-browser compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page }) => {
      await page.goto('/');
      
      // Test core functionality
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
      
      // Test interactive elements
      await page.click('[data-testid="primary-button"]');
      await expect(page.locator('[data-testid="result"]')).toContainText('Success');
      
      // Test responsive behavior
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });
  });
});
```

### 2. Web Performance Standards

#### Core Web Vitals Requirements
```markdown
## Performance Benchmarks

### Core Web Vitals (Google)
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### Additional Performance Metrics
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Time to Interactive (TTI)**: < 3.8 seconds
- **Total Blocking Time (TBT)**: < 200 milliseconds
- **Speed Index**: < 3.4 seconds

### Resource Optimization
- **JavaScript Bundle Size**: < 250KB gzipped
- **CSS Bundle Size**: < 50KB gzipped
- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Preload critical fonts, font-display: swap
```

#### Performance Testing Automation
```javascript
// Example Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 3. Web Accessibility Standards

#### WCAG 2.1 AA Compliance
```markdown
## Accessibility Requirements

### Level A Requirements
- [ ] Images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] Page has proper heading structure (h1-h6)
- [ ] Links have descriptive text
- [ ] Color is not the only means of conveying information

### Level AA Requirements
- [ ] Color contrast ratio is at least 4.5:1 for normal text
- [ ] Color contrast ratio is at least 3:1 for large text
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] Content is accessible via keyboard navigation
- [ ] Focus indicators are visible and clear

### Additional Accessibility Features
- [ ] Screen reader compatibility tested
- [ ] ARIA labels and roles implemented correctly
- [ ] Skip navigation links provided
- [ ] Error messages are descriptive and helpful
- [ ] Time limits can be extended or disabled
```

#### Accessibility Testing Tools
```javascript
// Example axe-core automated accessibility testing
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('should not have any automatically detectable accessibility issues', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});

// Manual accessibility testing checklist
test('manual accessibility verification', async ({ page }) => {
  await page.goto('/');
  
  // Test keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
  
  // Test screen reader announcements
  const ariaLabel = await page.locator('[aria-label]').first().getAttribute('aria-label');
  expect(ariaLabel).toBeTruthy();
  
  // Test color contrast (requires manual verification)
  // Document: All text meets WCAG AA contrast requirements
});
```

### 4. Progressive Web App (PWA) Standards

#### PWA Compliance Checklist
```markdown
## PWA Requirements

### Core PWA Features
- [ ] Service worker implemented for offline functionality
- [ ] Web app manifest with proper metadata
- [ ] HTTPS served on all pages
- [ ] Responsive design works on all devices
- [ ] Fast loading performance (< 3 seconds)

### Enhanced PWA Features
- [ ] Add to home screen functionality
- [ ] Push notifications (if applicable)
- [ ] Background sync for offline actions
- [ ] App shell architecture implemented
- [ ] Proper caching strategies for different content types

### PWA Manifest Example
```json
{
  "name": "Application Name",
  "short_name": "App",
  "description": "Application description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 5. SEO and Web Standards

#### SEO Quality Standards
```markdown
## SEO Requirements

### Technical SEO
- [ ] Proper HTML semantic structure
- [ ] Meta titles and descriptions on all pages
- [ ] Open Graph and Twitter Card metadata
- [ ] Structured data markup (JSON-LD)
- [ ] XML sitemap generated and submitted

### Content SEO
- [ ] Unique, descriptive page titles
- [ ] Proper heading hierarchy (H1-H6)
- [ ] Alt text for all images
- [ ] Internal linking structure
- [ ] Page loading speed optimized

### SEO Testing
```javascript
// Example SEO validation tests
test('SEO metadata validation', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  const title = await page.title();
  expect(title).toBeTruthy();
  expect(title.length).toBeLessThanOrEqual(60);
  
  // Check meta description
  const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
  expect(metaDescription).toBeTruthy();
  expect(metaDescription.length).toBeLessThanOrEqual(160);
  
  // Check heading structure
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1);
  
  // Check alt text on images
  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  expect(imagesWithoutAlt).toBe(0);
});
```

## Web Quality Assurance Procedures

### 1. Pre-Deployment Quality Gates

#### Automated Web Quality Checks
```bash
#!/bin/bash
# Web-specific quality gate script

echo "Running Web Quality Validation..."

# Performance testing
echo "1. Running Lighthouse performance audit..."
npx lighthouse-ci autorun || exit 1

# Accessibility testing
echo "2. Running accessibility tests..."
npm run test:a11y || exit 1

# Cross-browser testing
echo "3. Running cross-browser tests..."
npx playwright test || exit 1

# SEO validation
echo "4. Validating SEO requirements..."
npm run test:seo || exit 1

# PWA compliance
echo "5. Checking PWA compliance..."
npm run test:pwa || exit 1

# Security headers
echo "6. Validating security headers..."
npm run test:security-headers || exit 1

echo "All web quality gates passed!"
```

### 2. Manual Web Quality Review

#### User Experience Quality Checklist
```markdown
## UX Quality Review

### Visual Design
- [ ] Design system components are used consistently
- [ ] Typography hierarchy is clear and readable
- [ ] Color scheme provides adequate contrast
- [ ] Spacing and layout are visually balanced
- [ ] Interactive elements have clear affordances

### User Interaction
- [ ] Navigation is intuitive and consistent
- [ ] Form validation provides helpful feedback
- [ ] Loading states are informative
- [ ] Error messages are clear and actionable
- [ ] Success confirmations are provided

### Mobile Experience
- [ ] Touch targets are appropriately sized (44px minimum)
- [ ] Content is readable without zooming
- [ ] Horizontal scrolling is avoided
- [ ] Gestures work as expected
- [ ] Orientation changes are handled gracefully
```

### 3. Performance Monitoring Setup

#### Real User Monitoring (RUM)
```javascript
// Example Web Vitals monitoring setup
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send metrics to your analytics service
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Integration Points

### Previous Stage Dependencies
- **Stage 08 (Documentation)**: Web-specific documentation and deployment guides
- **Implementation**: Complete web application with all features
- **Testing**: All web-specific tests passing

### Next Stage Deliverables
- **Web Quality Report**: Comprehensive web quality assessment
- **Performance Baseline**: Established performance benchmarks
- **Accessibility Certification**: WCAG compliance verification
- **Browser Compatibility Matrix**: Validated browser support documentation

## Success Criteria
- All Core Web Vitals meet Google's recommended thresholds
- WCAG 2.1 AA accessibility compliance achieved
- Cross-browser compatibility verified on all supported platforms
- PWA compliance achieved (if applicable)
- SEO best practices implemented and validated

## Risk Mitigation
- **Performance Regression**: Continuous performance monitoring and alerting
- **Browser Compatibility Issues**: Regular testing on updated browser versions
- **Accessibility Violations**: Automated accessibility testing in CI/CD pipeline
- **SEO Impact**: Regular SEO audits and search ranking monitoring
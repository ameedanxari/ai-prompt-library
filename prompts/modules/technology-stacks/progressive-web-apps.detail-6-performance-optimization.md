### PWA Performance Optimization

```typescript
// src/utils/pwaOptimization.ts
export class PWAOptimizer {
  private static instance: PWAOptimizer;
  private performanceObserver: PerformanceObserver | null = null;

  static getInstance(): PWAOptimizer {
    if (!PWAOptimizer.instance) {
      PWAOptimizer.instance = new PWAOptimizer();
    }
    return PWAOptimizer.instance;
  }

  initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === 'paint') {
            this.trackPaintTiming(entry);
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.trackLCP(entry);
          } else if (entry.entryType === 'first-input') {
            this.trackFID(entry);
          } else if (entry.entryType === 'layout-shift') {
            this.trackCLS(entry);
          }
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    }
  }

  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      domComplete: entry.domComplete - entry.navigationStart,
      loadComplete: entry.loadEventEnd - entry.navigationStart
    };

    console.log('Navigation Timing:', metrics);
    this.sendMetricsToAnalytics('navigation', metrics);
  }

  private trackPaintTiming(entry: PerformanceEntry): void {
    console.log(`${entry.name}: ${entry.startTime}ms`);
    this.sendMetricsToAnalytics('paint', {
      name: entry.name,
      startTime: entry.startTime
    });
  }

  private trackLCP(entry: PerformanceEntry): void {
    console.log(`LCP: ${entry.startTime}ms`);
    this.sendMetricsToAnalytics('lcp', {
      startTime: entry.startTime
    });
  }

  private trackFID(entry: any): void {
    console.log(`FID: ${entry.processingStart - entry.startTime}ms`);
    this.sendMetricsToAnalytics('fid', {
      delay: entry.processingStart - entry.startTime
    });
  }

  private trackCLS(entry: any): void {
    if (!entry.hadRecentInput) {
      console.log(`CLS: ${entry.value}`);
      this.sendMetricsToAnalytics('cls', {
        value: entry.value
      });
    }
  }

  private sendMetricsToAnalytics(type: string, data: any): void {
    // Send to your analytics service
    if ('navigator' in window && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }));
    }
  }

  preloadCriticalResources(): void {
    const criticalResources = [
      '/static/css/critical.css',
      '/static/js/critical.js',
      '/static/fonts/main.woff2'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.includes('font')) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }

  optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src!;
      });
    }
  }

  enableResourceHints(): void {
    // DNS prefetch for external domains
    const externalDomains = [
      'https://api.example.com',
      'https://cdn.example.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical third-party origins
    const criticalOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    criticalOrigins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

// Initialize PWA optimization
const pwaOptimizer = PWAOptimizer.getInstance();
pwaOptimizer.initializePerformanceMonitoring();
pwaOptimizer.preloadCriticalResources();
pwaOptimizer.optimizeImages();
pwaOptimizer.enableResourceHints();
```


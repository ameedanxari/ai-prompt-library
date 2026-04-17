# Responsive Design Advanced Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing advanced responsive design strategies including fluid typography, container queries, adaptive components, touch optimization, and performance-aware responsive loading. It covers modern CSS techniques and progressive enhancement approaches.

## Context

Advanced responsive design goes beyond simple breakpoints to create truly adaptive experiences across all devices and contexts. This template addresses the challenges of implementing fluid layouts, optimizing for various input methods, managing responsive images and media, and ensuring performance across network conditions.

## Core Components

### Responsive Layout Service

## Examples

```typescript
interface ResponsiveLayoutService {
  // Breakpoint management
  getCurrentBreakpoint(): Breakpoint;
  onBreakpointChange(callback: BreakpointCallback): Unsubscribe;
  matchesBreakpoint(breakpoint: Breakpoint): boolean;
  
  // Container queries
  registerContainer(element: Element, name: string): void;
  getContainerSize(name: string): ContainerSize;
  onContainerResize(name: string, callback: ContainerResizeCallback): Unsubscribe;
  
  // Viewport
  getViewportSize(): ViewportSize;
  getOrientation(): 'portrait' | 'landscape';
  onOrientationChange(callback: OrientationCallback): Unsubscribe;
  
  // Device capabilities
  getDeviceCapabilities(): DeviceCapabilities;
  supportsHover(): boolean;
  supportsTouchInput(): boolean;
}

interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

interface ViewportSize {
  width: number;
  height: number;
  visualViewport: {
    width: number;
    height: number;
    scale: number;
  };
}

interface ContainerSize {
  width: number;
  height: number;
  inlineSize: number;
  blockSize: number;
}

interface DeviceCapabilities {
  touchScreen: boolean;
  hover: boolean;
  pointer: 'none' | 'coarse' | 'fine';
  colorGamut: 'srgb' | 'p3' | 'rec2020';
  prefersReducedMotion: boolean;
  prefersColorScheme: 'light' | 'dark';
  prefersContrast: 'no-preference' | 'more' | 'less';
}
```


### Fluid Typography Service

```typescript
interface FluidTypographyService {
  // Fluid sizing
  calculateFluidSize(minSize: number, maxSize: number, minViewport: number, maxViewport: number): string;
  generateFluidScale(config: FluidScaleConfig): FluidScale;
  
  // Type scale
  getTypeScale(level: number): TypeScaleValue;
  applyTypeScale(element: Element, level: number): void;
  
  // Line height and spacing
  calculateOptimalLineHeight(fontSize: number): number;
  calculateOptimalParagraphSpacing(fontSize: number): number;
}

interface FluidScaleConfig {
  minViewport: number;
  maxViewport: number;
  minFontSize: number;
  maxFontSize: number;
  scaleRatio: number;
  steps: number;
}

interface FluidScale {
  steps: FluidScaleStep[];
  cssVariables: string;
}

interface FluidScaleStep {
  level: number;
  minSize: number;
  maxSize: number;
  clampValue: string;
}

interface TypeScaleValue {
  fontSize: string;
  lineHeight: number;
  letterSpacing?: string;
  fontWeight?: number;
}
```

### Responsive Image Service

```typescript
interface ResponsiveImageService {
  // Image optimization
  generateSrcSet(src: string, widths: number[]): string;
  generateSizes(breakpoints: ImageBreakpoint[]): string;
  
  // Art direction
  createPictureElement(config: PictureConfig): HTMLPictureElement;
  
  // Lazy loading
  enableLazyLoading(images: HTMLImageElement[]): void;
  preloadImage(src: string, options?: PreloadOptions): Promise<void>;
  
  // Performance
  getOptimalImageFormat(): ImageFormat;
  supportsFormat(format: ImageFormat): boolean;
}

interface ImageBreakpoint {
  mediaQuery: string;
  size: string;
}

interface PictureConfig {
  sources: PictureSource[];
  fallback: ImageConfig;
  alt: string;
  loading?: 'lazy' | 'eager';
}

interface PictureSource {
  srcset: string;
  media?: string;
  type?: string;
  sizes?: string;
}

type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'gif';
```

### Touch and Pointer Service

```typescript
interface TouchPointerService {
  // Input detection
  getPrimaryInputType(): 'touch' | 'mouse' | 'pen';
  supportsMultiTouch(): boolean;
  
  // Touch targets
  validateTouchTarget(element: Element): TouchTargetValidation;
  getMinimumTouchTargetSize(): number;
  
  // Gestures
  enableSwipeGesture(element: Element, config: SwipeConfig): void;
  enablePinchZoom(element: Element, config: PinchConfig): void;
  enableLongPress(element: Element, callback: LongPressCallback): void;
  
  // Hover alternatives
  provideTouchAlternative(hoverElement: Element): void;
}

interface TouchTargetValidation {
  valid: boolean;
  width: number;
  height: number;
  minimumRequired: number;
  issues: string[];
}

interface SwipeConfig {
  direction: 'horizontal' | 'vertical' | 'both';
  threshold: number;
  onSwipe: (direction: SwipeDirection) => void;
}

interface PinchConfig {
  minScale: number;
  maxScale: number;
  onPinch: (scale: number) => void;
}

type SwipeDirection = 'left' | 'right' | 'up' | 'down';
```

## Implementation Patterns

### Fluid Typography Implementation

```typescript
class FluidTypographyManager implements FluidTypographyService {
  private minViewport: number = 320;
  private maxViewport: number = 1200;

  calculateFluidSize(
    minSize: number,
    maxSize: number,
    minViewport: number = this.minViewport,
    maxViewport: number = this.maxViewport
  ): string {
    // Calculate slope and intercept for linear interpolation
    const slope = (maxSize - minSize) / (maxViewport - minViewport);
    const intercept = minSize - slope * minViewport;

    // Convert to viewport units
    const slopeVw = slope * 100;
    const interceptRem = intercept / 16;

    // Generate clamp() value
    return `clamp(${minSize / 16}rem, ${interceptRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxSize / 16}rem)`;
  }

  generateFluidScale(config: FluidScaleConfig): FluidScale {
    const steps: FluidScaleStep[] = [];
    let minSize = config.minFontSize;
    let maxSize = config.maxFontSize;

    for (let i = 0; i <= config.steps; i++) {
      const level = i - Math.floor(config.steps / 2);
      const scaleFactor = Math.pow(config.scaleRatio, level);
      
      const stepMinSize = config.minFontSize * scaleFactor;
      const stepMaxSize = config.maxFontSize * scaleFactor;

      steps.push({
        level,
        minSize: stepMinSize,
        maxSize: stepMaxSize,
        clampValue: this.calculateFluidSize(
          stepMinSize,
          stepMaxSize,
          config.minViewport,
          config.maxViewport
        )
      });
    }

    const cssVariables = steps
      .map(step => `--font-size-${step.level}: ${step.clampValue};`)
      .join('\n');

    return { steps, cssVariables };
  }

  calculateOptimalLineHeight(fontSize: number): number {
    // Optimal line height decreases as font size increases
    // Based on research: larger text needs less line height
    if (fontSize <= 16) return 1.6;
    if (fontSize <= 24) return 1.5;
    if (fontSize <= 32) return 1.4;
    if (fontSize <= 48) return 1.3;
    return 1.2;
  }
}
```

### Container Query Implementation

```typescript
class ContainerQueryManager {
  private containers: Map<string, Element> = new Map();
  private observers: Map<string, ResizeObserver> = new Map();

  registerContainer(element: Element, name: string): void {
    // Set container-type CSS property
    (element as HTMLElement).style.containerType = 'inline-size';
    (element as HTMLElement).style.containerName = name;
    
    this.containers.set(name, element);
    
    // Create resize observer for JavaScript-based queries
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.handleContainerResize(name, entry);
      }
    });
    
    observer.observe(element);
    this.observers.set(name, observer);
  }

  getContainerSize(name: string): ContainerSize {
    const element = this.containers.get(name);
    if (!element) {
      throw new Error(`Container not found: ${name}`);
    }

    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      inlineSize: rect.width,
      blockSize: rect.height
    };
  }

  // Generate CSS container queries
  generateContainerQuery(containerName: string, minWidth: number, styles: string): string {
    return `
      @container ${containerName} (min-width: ${minWidth}px) {
        ${styles}
      }
    `;
  }

  private handleContainerResize(name: string, entry: ResizeObserverEntry): void {
    const callbacks = this.resizeCallbacks.get(name) || [];
    const size: ContainerSize = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
      inlineSize: entry.borderBoxSize[0]?.inlineSize || entry.contentRect.width,
      blockSize: entry.borderBoxSize[0]?.blockSize || entry.contentRect.height
    };

    callbacks.forEach(callback => callback(size));
  }
}
```

### Responsive Image Manager

```typescript
class ResponsiveImageManager implements ResponsiveImageService {
  private supportedFormats: Set<ImageFormat> = new Set();

  constructor() {
    this.detectSupportedFormats();
  }

  generateSrcSet(src: string, widths: number[]): string {
    const format = this.getOptimalImageFormat();
    const basePath = src.replace(/\.[^.]+$/, '');
    
    return widths
      .map(width => `${basePath}-${width}w.${format} ${width}w`)
      .join(', ');
  }

  generateSizes(breakpoints: ImageBreakpoint[]): string {
    const sizes = breakpoints
      .map(bp => `${bp.mediaQuery} ${bp.size}`)
      .join(', ');
    
    // Add default size
    return `${sizes}, 100vw`;
  }

  createPictureElement(config: PictureConfig): HTMLPictureElement {
    const picture = document.createElement('picture');

    // Add sources in order of preference
    for (const source of config.sources) {
      const sourceEl = document.createElement('source');
      sourceEl.srcset = source.srcset;
      if (source.media) sourceEl.media = source.media;
      if (source.type) sourceEl.type = source.type;
      if (source.sizes) sourceEl.sizes = source.sizes;
      picture.appendChild(sourceEl);
    }

    // Add fallback img
    const img = document.createElement('img');
    img.src = config.fallback.src;
    img.alt = config.alt;
    img.loading = config.loading || 'lazy';
    if (config.fallback.width) img.width = config.fallback.width;
    if (config.fallback.height) img.height = config.fallback.height;
    picture.appendChild(img);

    return picture;
  }

  enableLazyLoading(images: HTMLImageElement[]): void {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      images.forEach(img => {
        img.loading = 'lazy';
      });
    } else {
      // Fallback to Intersection Observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      images.forEach(img => {
        img.dataset.src = img.src;
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        observer.observe(img);
      });
    }
  }

  getOptimalImageFormat(): ImageFormat {
    if (this.supportedFormats.has('avif')) return 'avif';
    if (this.supportedFormats.has('webp')) return 'webp';
    return 'jpeg';
  }

  private async detectSupportedFormats(): Promise<void> {
    // Check AVIF support
    const avifSupport = await this.checkFormatSupport(
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIAyACCAAAKAABgAA=='
    );
    if (avifSupport) this.supportedFormats.add('avif');

    // Check WebP support
    const webpSupport = await this.checkFormatSupport(
      'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
    );
    if (webpSupport) this.supportedFormats.add('webp');
  }

  private checkFormatSupport(dataUri: string): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
      img.src = dataUri;
    });
  }
}
```

### Touch Optimization

```typescript
class TouchOptimizationService implements TouchPointerService {
  private minimumTouchTarget = 44; // WCAG 2.5.5 minimum

  getPrimaryInputType(): 'touch' | 'mouse' | 'pen' {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return 'touch';
    }
    if (window.matchMedia('(pointer: fine)').matches) {
      return 'mouse';
    }
    return 'touch'; // Default to touch for safety
  }

  validateTouchTarget(element: Element): TouchTargetValidation {
    const rect = element.getBoundingClientRect();
    const issues: string[] = [];

    if (rect.width < this.minimumTouchTarget) {
      issues.push(`Width (${rect.width}px) is below minimum (${this.minimumTouchTarget}px)`);
    }
    if (rect.height < this.minimumTouchTarget) {
      issues.push(`Height (${rect.height}px) is below minimum (${this.minimumTouchTarget}px)`);
    }

    return {
      valid: issues.length === 0,
      width: rect.width,
      height: rect.height,
      minimumRequired: this.minimumTouchTarget,
      issues
    };
  }

  enableSwipeGesture(element: Element, config: SwipeConfig): void {
    let startX = 0;
    let startY = 0;

    element.addEventListener('touchstart', (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (config.direction === 'horizontal' || config.direction === 'both') {
        if (Math.abs(deltaX) > config.threshold) {
          config.onSwipe(deltaX > 0 ? 'right' : 'left');
        }
      }

      if (config.direction === 'vertical' || config.direction === 'both') {
        if (Math.abs(deltaY) > config.threshold) {
          config.onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }
    }, { passive: true });
  }

  provideTouchAlternative(hoverElement: Element): void {
    // Convert hover interactions to tap for touch devices
    if (this.getPrimaryInputType() === 'touch') {
      hoverElement.addEventListener('touchstart', () => {
        hoverElement.classList.add('touch-active');
      });

      hoverElement.addEventListener('touchend', () => {
        setTimeout(() => {
          hoverElement.classList.remove('touch-active');
        }, 300);
      });
    }
  }
}
```

## Integration Points

### CSS Framework Integration

```css
/* Modern responsive CSS patterns */

/* Fluid typography using clamp() */
:root {
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --font-size-lg: clamp(1.25rem, 1rem + 1vw, 2rem);
  --font-size-xl: clamp(1.5rem, 1rem + 2vw, 3rem);
  
  /* Fluid spacing */
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 1rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 2rem);
  --space-lg: clamp(2rem, 1.5rem + 2vw, 4rem);
}

/* Container queries */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

/* Responsive touch targets */
@media (pointer: coarse) {
  .button,
  .link,
  .interactive {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Security Considerations

### Responsive Security

```typescript
class ResponsiveSecurityService {
  // Prevent layout-based attacks
  validateLayoutIntegrity(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    
    // Check for suspicious positioning (potential clickjacking)
    if (rect.width < 1 || rect.height < 1) {
      console.warn('Element has suspicious dimensions');
      return false;
    }
    
    // Check visibility
    const style = getComputedStyle(element);
    if (style.opacity === '0' || style.visibility === 'hidden') {
      console.warn('Element is hidden but interactive');
      return false;
    }
    
    return true;
  }

  // Secure viewport meta tag
  enforceSecureViewport(): void {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
      );
    }
  }
}
```

## Testing Considerations

### Responsive Design Tests

```typescript
describe('Responsive Design Tests', () => {
  it('should calculate fluid typography correctly', () => {
    const typography = new FluidTypographyManager();
    const result = typography.calculateFluidSize(16, 24, 320, 1200);
    
    expect(result).toMatch(/^clamp\(/);
    expect(result).toContain('rem');
    expect(result).toContain('vw');
  });

  it('should validate touch targets', () => {
    const touchService = new TouchOptimizationService();
    
    const smallButton = document.createElement('button');
    smallButton.style.width = '30px';
    smallButton.style.height = '30px';
    document.body.appendChild(smallButton);
    
    const validation = touchService.validateTouchTarget(smallButton);
    expect(validation.valid).toBe(false);
    expect(validation.issues.length).toBeGreaterThan(0);
  });

  it('should generate correct srcset', () => {
    const imageService = new ResponsiveImageManager();
    const srcset = imageService.generateSrcSet('/images/hero.jpg', [320, 640, 1024]);
    
    expect(srcset).toContain('320w');
    expect(srcset).toContain('640w');
    expect(srcset).toContain('1024w');
  });
});
```

## Configuration Examples

### Responsive Configuration

```typescript
const responsiveConfig: ResponsiveConfig = {
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  },
  typography: {
    minViewport: 320,
    maxViewport: 1200,
    baseSize: { min: 16, max: 20 },
    scaleRatio: 1.25
  },
  spacing: {
    baseUnit: 4,
    scale: [0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64]
  },
  images: {
    widths: [320, 640, 768, 1024, 1280, 1536, 1920],
    formats: ['avif', 'webp', 'jpeg'],
    quality: { avif: 80, webp: 85, jpeg: 90 }
  },
  touch: {
    minimumTargetSize: 44,
    tapHighlightColor: 'transparent'
  }
};
```

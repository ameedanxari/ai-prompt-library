# Responsive Design Module

## Purpose
This module provides comprehensive responsive design patterns that ensure optimal user experience across all devices and screen sizes. It implements mobile-first design principles, accessibility compliance, and performance optimization while supporting internationalization and offline scenarios. The module ensures consistent functionality and visual hierarchy from mobile phones to large desktop displays, with special attention to touch interfaces, keyboard navigation, and assistive technologies.

## Integration Points

This template integrates with the following v2 templates:
- **Accessibility** (`accessibility/accessibility-compliance.md`): WCAG compliance patterns
- **Performance** (`performance/resource-optimization.md`): Image and asset optimization
- **Analytics** (`analytics/user-analytics.md`): Device and viewport analytics
- **Internationalization** (`accessibility/internationalization.md`): RTL and multi-language support

### Cross-Domain Composition Support

This template supports composition with domain-specific templates:
- **Commerce** (`commerce/product-catalog.md`): Responsive product displays
- **Media Streaming** (`media-streaming/streaming-quality.md`): Adaptive media delivery
- **Social** (`social/content-feeds.md`): Responsive feed layouts
- **Content Management** (`content-management/content-creation.md`): Responsive editors
- **Healthcare** (`healthcare/telemedicine.md`): Responsive video consultations

## Instructions
Use this module to implement responsive layouts in your application. Start with mobile-first design, then progressively enhance for larger screens using the provided breakpoint system. Implement flexible grid systems using CSS Grid and Flexbox, ensure all interactive elements meet minimum touch target requirements (44px), and support text scaling up to 200%. Use the responsive image components for optimal loading performance, implement RTL support for international users, and ensure all layouts work in high contrast mode. Test across all breakpoints and validate accessibility compliance.

## Examples

### Basic Responsive Layout
```css
/* Mobile-first responsive container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container { padding: 0 2rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 3rem; }
}
```

### React Responsive Component
```typescript
function ResponsiveCard() {
  const breakpoint = useBreakpoint();
  
  return (
    <div className={`card card--${breakpoint}`}>
      <ResponsiveImage 
        src="/api/images/hero.jpg"
        alt="Hero image"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="card__content">
        <h2>Responsive Title</h2>
        <p>Content that adapts to screen size</p>
      </div>
    </div>
  );
}
```

### Mobile Responsive Styles
```typescript
// React Native responsive utilities
const styles = createResponsiveStyles();

function MobileCard() {
  const { isTablet } = ResponsiveUtils.getScreenData();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.text}>
          {isTablet ? 'Tablet Layout' : 'Mobile Layout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### RTL Support Implementation
```css
/* RTL layout support */
[dir="rtl"] .navigation {
  flex-direction: row-reverse;
}

[dir="rtl"] .card {
  text-align: right;
  margin-left: 0;
  margin-right: 1rem;
}
```

## Overview
Implement comprehensive responsive design with mobile-first approach, accessibility compliance, and performance optimization across all devices and screen sizes.

## Core Implementation Requirements

### Responsive Architecture
- **Mobile-First Design**: Start with mobile layout, progressively enhance for larger screens
- **Flexible Grid System**: CSS Grid and Flexbox for adaptive layouts
- **Fluid Typography**: Responsive typography that scales with viewport
- **Adaptive Images**: Responsive images with appropriate formats and sizes
- **Touch-Friendly Interfaces**: Minimum 44px touch targets, appropriate spacing

### Breakpoint Strategy
- **Standard Breakpoints**: Mobile (320px+), Tablet (768px+), Desktop (1024px+), Large (1440px+)
- **Content-Based Breakpoints**: Additional breakpoints based on content needs
- **Container Queries**: Use container queries for component-level responsiveness
- **Orientation Handling**: Adapt layouts for portrait/landscape orientations

### Accessibility Implementation
- **Scalable Text**: Support up to 200% text scaling without horizontal scrolling
- **Focus Management**: Maintain logical focus order across all screen sizes
- **Touch Accessibility**: Ensure touch targets meet WCAG guidelines (minimum 44x44px)
- **Screen Reader Support**: Maintain semantic structure across responsive layouts
- **High Contrast**: Ensure responsive design works in high contrast mode

### Internationalization Support
- **RTL Layout Support**: Full right-to-left layout support with proper text flow
- **Text Expansion**: Account for text expansion in different languages (up to 30% longer)
- **Cultural Adaptations**: Adapt layouts for different cultural reading patterns
- **Font Loading**: Optimize font loading for different languages and scripts

### Offline & Network Resilience
- **Graceful Degradation**: Provide fallback layouts when network resources fail to load
- **Offline-First CSS**: Ensure core styles work without external dependencies
- **Progressive Enhancement**: Layer responsive features based on network availability
- **Cached Resources**: Cache critical CSS and fonts for offline access
- **Fallback Fonts**: Specify comprehensive font stacks for offline scenarios

### Security Features
- **Content Security Policy**: Implement CSP headers to prevent XSS attacks
- **Secure Resource Loading**: Use HTTPS for all external resources and fonts
- **Input Validation**: Sanitize all user inputs in responsive forms
- **Safe Image Loading**: Validate image sources and implement proper error handling
- **Privacy Protection**: Ensure responsive images don't leak user data through URLs

### Performance Optimization
- **Critical CSS**: Inline critical CSS for above-the-fold content
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Image Optimization**: Serve appropriate image sizes for each breakpoint
- **Lazy Loading**: Implement lazy loading for images and non-critical content
- **Resource Hints**: Use preload, prefetch, and preconnect for performance

### Platform-Specific Implementations

#### CSS Implementation
```css
/* Mobile-first responsive design */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Typography scaling */
:root {
  --font-size-base: clamp(1rem, 2.5vw, 1.125rem);
  --font-size-h1: clamp(1.75rem, 4vw, 2.5rem);
  --font-size-h2: clamp(1.5rem, 3.5vw, 2rem);
  --spacing-unit: clamp(0.5rem, 2vw, 1rem);
}

/* Responsive grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--spacing-unit);
}

/* Touch-friendly buttons */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  touch-action: manipulation;
}

/* Responsive images */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Breakpoint mixins */
@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

/* RTL support */
[dir="rtl"] .container {
  text-align: right;
}

[dir="rtl"] .grid {
  direction: rtl;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .button {
    border: 2px solid;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### React Implementation
```typescript
// Responsive hook for breakpoint detection
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<string>('mobile');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1440) setBreakpoint('xlarge');
      else if (width >= 1024) setBreakpoint('desktop');
      else if (width >= 768) setBreakpoint('tablet');
      else setBreakpoint('mobile');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

// Responsive component with accessibility
const ResponsiveLayout: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const breakpoint = useBreakpoint();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div 
      className={`responsive-layout ${className || ''}`}
      data-breakpoint={breakpoint}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </div>
  );
};

// Responsive image component
const ResponsiveImage: React.FC<{
  src: string;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}> = ({ src, alt, sizes = '100vw', loading = 'lazy' }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    // Generate responsive image URLs based on breakpoints
    const generateSrcSet = () => {
      const breakpoints = [320, 768, 1024, 1440];
      return breakpoints
        .map(width => `${src}?w=${width} ${width}w`)
        .join(', ');
    };
    
    setImageSrc(generateSrcSet());
  }, [src]);
  
  return (
    <img
      src={src}
      srcSet={imageSrc}
      sizes={sizes}
      alt={alt}
      loading={loading}
      className="responsive-image"
      onError={(e) => {
        // Fallback to original image on error
        e.currentTarget.srcSet = '';
      }}
    />
  );
};
```

#### Mobile Implementation
```typescript
// React Native responsive utilities
import { Dimensions, PixelRatio } from 'react-native';

class ResponsiveUtils {
  static getScreenData() {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      isTablet: width >= 768,
      isLandscape: width > height,
      pixelRatio: PixelRatio.get()
    };
  }
  
  static wp(percentage: number): number {
    const { width } = Dimensions.get('window');
    return (percentage * width) / 100;
  }
  
  static hp(percentage: number): number {
    const { height } = Dimensions.get('window');
    return (percentage * height) / 100;
  }
  
  static normalize(size: number): number {
    const { width } = Dimensions.get('window');
    const scale = width / 320; // Base width
    const newSize = size * scale;
    
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
}

// Responsive styles
const createResponsiveStyles = () => {
  const { width, isTablet } = ResponsiveUtils.getScreenData();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: isTablet ? ResponsiveUtils.wp(5) : ResponsiveUtils.wp(4),
    },
    
    button: {
      minHeight: ResponsiveUtils.normalize(44),
      paddingVertical: ResponsiveUtils.normalize(12),
      paddingHorizontal: ResponsiveUtils.normalize(24),
    },
    
    text: {
      fontSize: ResponsiveUtils.normalize(16),
      lineHeight: ResponsiveUtils.normalize(24),
    },
    
    grid: {
      flexDirection: isTablet ? 'row' : 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    }
  });
};
```

## Testing Requirements

### Unit Tests
- Test breakpoint detection logic
- Test responsive utility functions
- Test image srcset generation
- Test RTL layout switching

### Property-Based Tests
- **Responsive Scaling Property**: For any screen size, all elements should scale appropriately and remain accessible
- **Touch Target Property**: For any interactive element, it should meet minimum touch target requirements across all devices
- **Text Scaling Property**: For any text content, it should remain readable and not overflow at 200% zoom

### Visual Regression Tests
- Test layouts across all supported breakpoints
- Test RTL layouts for all components
- Test high contrast mode compatibility
- Test with different font sizes and zoom levels

### Accessibility Tests
- Test keyboard navigation across all breakpoints
- Test screen reader compatibility with responsive layouts
- Test focus management during orientation changes

### Performance Tests
- Test image loading performance across different connection speeds
- Test layout shift metrics (CLS) during responsive changes
- Test critical CSS delivery and rendering performance

## Monitoring & Observability

### Metrics to Track
- Page load times across different device types
- Layout shift metrics (Cumulative Layout Shift)
- Image loading performance and optimization effectiveness
- User interaction patterns across different screen sizes

### User Experience Monitoring
- Track user engagement across different breakpoints
- Monitor touch target interaction success rates
- Track accessibility feature usage (zoom, high contrast)

## Configuration Variables
- `{{breakpoints}}` - Custom breakpoint definitions
- `{{grid_columns}}` - Grid system column configuration
- `{{touch_target_size}}` - Minimum touch target size
- `{{image_formats}}` - Supported responsive image formats
- `{{rtl_support}}` - Enable/disable RTL layout support

## Dependencies
- CSS Grid and Flexbox support
- Responsive image service or CDN
- Intersection Observer API for lazy loading
- ResizeObserver API for container queries
- Internationalization framework for RTL support

## Documentation Requirements
- Responsive design system documentation
- Breakpoint usage guidelines
- Image optimization guidelines
- RTL layout implementation guide
- Accessibility compliance checklist

## Advanced Responsive Design Patterns

### Container Queries for Component-Level Responsiveness

```css
/* Modern container query patterns */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }
  
  .card__image {
    aspect-ratio: 1;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 250px 1fr;
  }
  
  .card__actions {
    flex-direction: row;
  }
}

/* Container query with style queries */
@container style(--theme: dark) {
  .card {
    background: var(--dark-surface);
    color: var(--dark-text);
  }
}
```

### Responsive Design Tokens System

```typescript
// Design token system for responsive theming
interface ResponsiveDesignTokens {
  breakpoints: BreakpointTokens;
  spacing: ResponsiveSpacing;
  typography: ResponsiveTypography;
  colors: ThemeColors;
}

const designTokens: ResponsiveDesignTokens = {
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
    ultrawide: '1920px'
  },
  spacing: {
    base: 'clamp(0.5rem, 2vw, 1rem)',
    section: 'clamp(2rem, 5vw, 4rem)',
    container: 'clamp(1rem, 5vw, 3rem)'
  },
  typography: {
    base: 'clamp(1rem, 2.5vw, 1.125rem)',
    h1: 'clamp(2rem, 5vw, 3.5rem)',
    h2: 'clamp(1.5rem, 4vw, 2.5rem)',
    h3: 'clamp(1.25rem, 3vw, 1.75rem)'
  },
  colors: {
    light: {
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#1a1a1a'
    },
    dark: {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff'
    }
  }
};

// CSS custom properties generation
function generateCSSVariables(tokens: ResponsiveDesignTokens): string {
  return `
    :root {
      /* Breakpoints */
      --breakpoint-mobile: ${tokens.breakpoints.mobile};
      --breakpoint-tablet: ${tokens.breakpoints.tablet};
      --breakpoint-desktop: ${tokens.breakpoints.desktop};
      
      /* Responsive spacing */
      --spacing-base: ${tokens.spacing.base};
      --spacing-section: ${tokens.spacing.section};
      --spacing-container: ${tokens.spacing.container};
      
      /* Responsive typography */
      --font-size-base: ${tokens.typography.base};
      --font-size-h1: ${tokens.typography.h1};
      --font-size-h2: ${tokens.typography.h2};
      --font-size-h3: ${tokens.typography.h3};
    }
  `;
}
```

### Responsive Component Architecture

```typescript
// React responsive component with analytics integration
interface ResponsiveComponentProps {
  children: React.ReactNode;
  mobileLayout?: 'stack' | 'carousel' | 'accordion';
  tabletLayout?: 'grid' | 'masonry' | 'list';
  desktopLayout?: 'grid' | 'sidebar' | 'full-width';
  trackViewport?: boolean;
}

const ResponsiveComponent: React.FC<ResponsiveComponentProps> = ({
  children,
  mobileLayout = 'stack',
  tabletLayout = 'grid',
  desktopLayout = 'grid',
  trackViewport = true
}) => {
  const { breakpoint, width, height, orientation } = useResponsive();
  const analytics = useAnalytics();

  // Track viewport changes for analytics
  useEffect(() => {
    if (trackViewport) {
      analytics.track('viewport_change', {
        breakpoint,
        width,
        height,
        orientation,
        devicePixelRatio: window.devicePixelRatio
      });
    }
  }, [breakpoint, trackViewport]);

  const layout = useMemo(() => {
    switch (breakpoint) {
      case 'mobile': return mobileLayout;
      case 'tablet': return tabletLayout;
      default: return desktopLayout;
    }
  }, [breakpoint, mobileLayout, tabletLayout, desktopLayout]);

  return (
    <div 
      className={`responsive-component responsive-component--${layout}`}
      data-breakpoint={breakpoint}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
};

// Custom hook for responsive state
function useResponsive() {
  const [state, setState] = useState({
    breakpoint: 'mobile',
    width: 0,
    height: 0,
    orientation: 'portrait'
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        breakpoint: getBreakpoint(width),
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    updateState();
    
    const resizeObserver = new ResizeObserver(updateState);
    resizeObserver.observe(document.body);
    
    return () => resizeObserver.disconnect();
  }, []);

  return state;
}
```

### Responsive Image System with Performance Optimization

```typescript
// Advanced responsive image component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty' | 'shimmer';
  onLoad?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  aspectRatio = '16/9',
  priority = false,
  quality = 80,
  placeholder = 'shimmer',
  onLoad
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive srcset
  const srcSet = useMemo(() => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(w => `${generateImageUrl(src, w, quality)} ${w}w`)
      .join(', ');
  }, [src, quality]);

  // Generate sizes attribute
  const sizes = useMemo(() => {
    return `
      (max-width: 320px) 320px,
      (max-width: 768px) 768px,
      (max-width: 1024px) 1024px,
      (max-width: 1280px) 1280px,
      1920px
    `.trim();
  }, []);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          imgRef.current!.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, priority]);

  return (
    <div 
      className={`responsive-image ${loaded ? 'loaded' : ''}`}
      style={{ aspectRatio }}
    >
      {placeholder === 'shimmer' && !loaded && (
        <div className="responsive-image__shimmer" aria-hidden="true" />
      )}
      
      <picture>
        {/* WebP for modern browsers */}
        <source
          type="image/webp"
          srcSet={srcSet.replace(/\.(jpg|png)/g, '.webp')}
          sizes={sizes}
        />
        
        {/* AVIF for cutting-edge browsers */}
        <source
          type="image/avif"
          srcSet={srcSet.replace(/\.(jpg|png)/g, '.avif')}
          sizes={sizes}
        />
        
        {/* Fallback */}
        <img
          ref={imgRef}
          src={priority ? src : undefined}
          srcSet={priority ? srcSet : undefined}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
          onError={() => setError(true)}
          className="responsive-image__img"
        />
      </picture>
      
      {error && (
        <div className="responsive-image__error" role="img" aria-label={alt}>
          <span>Image failed to load</span>
        </div>
      )}
    </div>
  );
};
```

### Responsive Navigation Patterns

```typescript
// Adaptive navigation component
interface ResponsiveNavProps {
  items: NavItem[];
  logo: React.ReactNode;
  actions?: React.ReactNode;
}

const ResponsiveNav: React.FC<ResponsiveNavProps> = ({ items, logo, actions }) => {
  const { breakpoint } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Trap focus in mobile menu
  useEffect(() => {
    if (mobileMenuOpen && navRef.current) {
      trapFocus(navRef.current);
    }
  }, [mobileMenuOpen]);

  if (breakpoint === 'mobile') {
    return (
      <nav ref={navRef} className="nav nav--mobile" aria-label="Main navigation">
        <div className="nav__header">
          {logo}
          <button
            className="nav__toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="nav__toggle-icon" aria-hidden="true">
              {mobileMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
        
        <div
          id="mobile-menu"
          className={`nav__menu ${mobileMenuOpen ? 'nav__menu--open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <ul className="nav__list" role="menubar">
            {items.map((item, index) => (
              <li key={item.id} role="none">
                <a
                  href={item.href}
                  className="nav__link"
                  role="menuitem"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {actions}
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav nav--desktop" aria-label="Main navigation">
      {logo}
      <ul className="nav__list" role="menubar">
        {items.map(item => (
          <li key={item.id} role="none">
            <a href={item.href} className="nav__link" role="menuitem">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {actions}
    </nav>
  );
};
```

## Domain-Specific Responsive Patterns

### E-Commerce Responsive Product Grid

```typescript
// Responsive product grid with commerce integration
const ResponsiveProductGrid: React.FC<{ products: Product[] }> = ({ products }) => {
  const { breakpoint } = useResponsive();
  
  const gridConfig = useMemo(() => {
    switch (breakpoint) {
      case 'mobile': return { columns: 2, gap: '0.5rem', cardSize: 'compact' };
      case 'tablet': return { columns: 3, gap: '1rem', cardSize: 'medium' };
      default: return { columns: 4, gap: '1.5rem', cardSize: 'full' };
    }
  }, [breakpoint]);

  return (
    <div
      className="product-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
        gap: gridConfig.gap
      }}
    >
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          size={gridConfig.cardSize}
        />
      ))}
    </div>
  );
};
```

### Healthcare Responsive Dashboard

```typescript
// Responsive healthcare dashboard layout
const HealthcareDashboard: React.FC = () => {
  const { breakpoint, orientation } = useResponsive();

  const layout = useMemo(() => {
    if (breakpoint === 'mobile') {
      return 'single-column';
    }
    if (breakpoint === 'tablet' && orientation === 'portrait') {
      return 'stacked';
    }
    return 'sidebar';
  }, [breakpoint, orientation]);

  return (
    <div className={`dashboard dashboard--${layout}`}>
      <aside className="dashboard__sidebar">
        <PatientList compact={breakpoint === 'mobile'} />
      </aside>
      
      <main className="dashboard__main">
        <VitalsChart responsive />
        <AppointmentList />
      </main>
      
      {breakpoint !== 'mobile' && (
        <aside className="dashboard__alerts">
          <AlertPanel />
        </aside>
      )}
    </div>
  );
};
```

## Template Composition Rules

### Compatible Templates
- `accessibility/accessibility-compliance.md` - Always compatible
- `performance/caching-strategies.md` - Image caching integration
- `analytics/user-analytics.md` - Viewport tracking
- `accessibility/internationalization.md` - RTL support

### Conflict Resolution
- When composing with `media-streaming/streaming-quality.md`, adaptive bitrate takes precedence
- When composing with `accessibility/accessibility-compliance.md`, minimum touch targets are enforced
- When composing with `performance/resource-optimization.md`, image optimization settings are merged
# Design System Generation Template

## Purpose
Generate comprehensive design systems with color schemes, typography, component libraries, white-label support, and responsive design specifications that ensure consistency across all platforms and support easy customization.

## Core Design System Prompts

### Comprehensive Design System Generation

```markdown
# Design System Generation

You are a senior design systems architect responsible for creating comprehensive, scalable design systems. Your task is to generate a complete design system that ensures visual consistency, supports white-label customization, and works seamlessly across all target platforms.

## Project Context
- Brand Identity: [INSERT_BRAND_IDENTITY]
- Target Platforms: [INSERT_PLATFORMS]
- User Demographics: [INSERT_USER_DEMOGRAPHICS]
- Accessibility Requirements: [INSERT_ACCESSIBILITY_LEVEL]
- Customization Needs: [INSERT_CUSTOMIZATION_SCOPE]

## Design System Architecture

### 1. Design Token Foundation

#### Color System
```css
/* Primary Color Palette */
:root {
  /* Primary Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
  --color-primary-950: #082f49;

  /* Secondary Colors */
  --color-secondary-50: #fafaf9;
  --color-secondary-100: #f5f5f4;
  --color-secondary-200: #e7e5e4;
  --color-secondary-300: #d6d3d1;
  --color-secondary-400: #a8a29e;
  --color-secondary-500: #78716c;
  --color-secondary-600: #57534e;
  --color-secondary-700: #44403c;
  --color-secondary-800: #292524;
  --color-secondary-900: #1c1917;
  --color-secondary-950: #0c0a09;

  /* Semantic Colors */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  --color-info-50: #eff6ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;

  /* Neutral Colors */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0a0a0a;
}

/* Dark Mode Color Overrides */
[data-theme="dark"] {
  --color-background: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-300);
  --color-border: var(--color-neutral-700);
}

/* Light Mode Color Assignments */
[data-theme="light"] {
  --color-background: var(--color-neutral-50);
  --color-surface: var(--color-neutral-100);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-border: var(--color-neutral-200);
}
```

#### Typography System
```css
/* Typography Scale */
:root {
  /* Font Families */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-serif: 'Merriweather', Georgia, serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Font Weights */
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  --font-weight-black: 900;

  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  --font-size-6xl: 3.75rem;   /* 60px */
  --font-size-7xl: 4.5rem;    /* 72px */
  --font-size-8xl: 6rem;      /* 96px */
  --font-size-9xl: 8rem;      /* 128px */

  /* Line Heights */
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* Letter Spacing */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0em;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}

/* Typography Classes */
.text-display-1 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.text-display-2 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.text-heading-1 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.text-heading-2 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}

.text-heading-3 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-snug);
}

.text-body-large {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
}

.text-body {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
}

.text-body-small {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
}

.text-caption {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}
```

#### Spacing System
```css
/* Spacing Scale */
:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-28: 7rem;       /* 112px */
  --space-32: 8rem;       /* 128px */
  --space-36: 9rem;       /* 144px */
  --space-40: 10rem;      /* 160px */
  --space-44: 11rem;      /* 176px */
  --space-48: 12rem;      /* 192px */
  --space-52: 13rem;      /* 208px */
  --space-56: 14rem;      /* 224px */
  --space-60: 15rem;      /* 240px */
  --space-64: 16rem;      /* 256px */
  --space-72: 18rem;      /* 288px */
  --space-80: 20rem;      /* 320px */
  --space-96: 24rem;      /* 384px */
}
```

#### Border Radius System
```css
/* Border Radius Scale */
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

#### Shadow System
```css
/* Shadow Scale with box-shadow properties */
:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}

/* Apply box-shadow to components */
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
```

### 2. Component Library Architecture

#### Base Component Structure
```typescript
// Component interface definition
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ThemeableComponent extends ComponentProps {
  theme?: 'light' | 'dark' | 'auto';
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}
```

#### Button Component System
```typescript
// Button component with white-label support
interface ButtonProps extends ThemeableComponent {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  customColors,
  ...props
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ];

  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs', 'rounded'],
    sm: ['px-3', 'py-1.5', 'text-sm', 'rounded-md'],
    md: ['px-4', 'py-2', 'text-sm', 'rounded-md'],
    lg: ['px-6', 'py-3', 'text-base', 'rounded-lg'],
    xl: ['px-8', 'py-4', 'text-lg', 'rounded-lg']
  };

  const variantClasses = {
    primary: [
      'bg-primary-600',
      'text-white',
      'hover:bg-primary-700',
      'focus:ring-primary-500'
    ],
    secondary: [
      'bg-secondary-600',
      'text-white',
      'hover:bg-secondary-700',
      'focus:ring-secondary-500'
    ],
    outline: [
      'border',
      'border-primary-600',
      'text-primary-600',
      'hover:bg-primary-50',
      'focus:ring-primary-500'
    ],
    ghost: [
      'text-primary-600',
      'hover:bg-primary-50',
      'focus:ring-primary-500'
    ],
    danger: [
      'bg-error-600',
      'text-white',
      'hover:bg-error-700',
      'focus:ring-error-500'
    ]
  };

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    fullWidth && 'w-full',
    className
  ].filter(Boolean).join(' ');

  const customStyle = customColors ? {
    '--color-primary-600': customColors.primary,
    '--color-primary-700': customColors.primary,
    '--color-primary-500': customColors.primary,
  } as React.CSSProperties : {};

  return (
    <button
      className={classes}
      style={customStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
```

#### Input Component System
```typescript
// Input component with validation and theming
interface InputProps extends ThemeableComponent {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  size = 'md',
  disabled = false,
  error,
  helperText,
  label,
  required = false,
  leftIcon,
  rightIcon,
  className,
  customColors,
  ...props
}) => {
  const baseClasses = [
    'block',
    'w-full',
    'border',
    'rounded-md',
    'shadow-sm',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-base'],
    lg: ['px-4', 'py-3', 'text-lg']
  };

  const stateClasses = error ? [
    'border-error-300',
    'text-error-900',
    'placeholder-error-400',
    'focus:border-error-500',
    'focus:ring-error-500'
  ] : [
    'border-neutral-300',
    'text-neutral-900',
    'placeholder-neutral-400',
    'focus:border-primary-500',
    'focus:ring-primary-500'
  ];

  const inputClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...stateClasses,
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">{leftIcon}</span>
          </div>
        )}
        <input
          type={type}
          className={inputClasses}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">{rightIcon}</span>
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
```

### 3. Responsive Design System

#### Breakpoint System
```css
/* Responsive Breakpoints with min-width media queries */
:root {
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Container System with min-width breakpoints */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 475px) {
  .container { max-width: 475px; }
}

@media (min-width: 640px) {
  .container { 
    max-width: 640px;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 768px) {
  .container { 
    max-width: 768px;
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

#### Grid System
```css
/* Flexible Grid System */
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Responsive Grid Classes */
@media (min-width: 640px) {
  .sm\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sm\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .sm\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .sm\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .md\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .lg\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
}
```

## Design System Generation Instructions

## Accessibility

This section ensures WCAG 2.1 AA compliance with proper focus management, contrast ratios, and accessibility features throughout the design system.

## Customization

This section covers theme customization tools, runtime theme switching, and customization frameworks for white-label implementations.

1. **Analyze brand requirements** and target audience to determine appropriate design direction
2. **Create comprehensive design tokens** covering colors, typography, spacing, and other design primitives
3. **Design component library** with consistent patterns and white-label customization support
4. **Implement responsive design system** that works across all target screen sizes and devices
5. **Ensure accessibility compliance** with WCAG 2.1 AA standards throughout the system
6. **Create theme variants** including light mode, dark mode, and high contrast options
7. **Document usage guidelines** and best practices for designers and developers
8. **Provide customization framework** for white-label implementations
```

### White-Label Component Creation

## White-Label

This section covers white-label customization capabilities including rebrand support, customizable themes, and flexible component architecture that allows easy rebranding while maintaining consistency.

```markdown
# White-Label Component System

You are a component architect specializing in white-label design systems. Your task is to create flexible, customizable components that can be easily rebranded while maintaining consistency and usability across different brand implementations.

## White-Label Architecture Principles

### 1. Theme Configuration System
```typescript
// Theme configuration interface
interface ThemeConfig {
  brand: {
    name: string;
    logo: {
      light: string;
      dark: string;
      favicon: string;
    };
  };
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent?: ColorPalette;
    neutral: ColorPalette;
    semantic: {
      success: ColorPalette;
      warning: ColorPalette;
      error: ColorPalette;
      info: ColorPalette;
    };
  };
  typography: {
    fontFamily: {
      sans: string[];
      serif: string[];
      mono: string[];
    };
    scale: TypographyScale;
  };
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  customProperties?: Record<string, string>;
}

interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}
```

### 2. Theme Provider System
```typescript
// Theme provider for React applications
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme: ThemeConfig;
  defaultMode?: 'light' | 'dark';
}> = ({ children, defaultTheme, defaultMode = 'light' }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [mode, setMode] = useState<'light' | 'dark'>(defaultMode);

  useEffect(() => {
    // Apply theme to CSS custom properties
    const root = document.documentElement;
    
    // Apply color tokens
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    // Apply typography tokens
    root.style.setProperty('--font-family-sans', theme.typography.fontFamily.sans.join(', '));
    root.style.setProperty('--font-family-serif', theme.typography.fontFamily.serif.join(', '));
    root.style.setProperty('--font-family-mono', theme.typography.fontFamily.mono.join(', '));
    
    // Apply custom properties
    if (theme.customProperties) {
      Object.entries(theme.customProperties).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
    
    // Set theme mode
    root.setAttribute('data-theme', mode);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 3. Customizable Component Examples

#### White-Label Card Component
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  customStyles?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  radius = 'md',
  shadow = 'sm',
  customStyles,
  className,
  children,
  ...props
}) => {
  const baseClasses = [
    'block',
    'transition-all',
    'duration-200'
  ];

  const variantClasses = {
    default: ['bg-surface', 'border', 'border-border'],
    outlined: ['bg-transparent', 'border-2', 'border-border'],
    elevated: ['bg-surface', 'border-0'],
    filled: ['bg-primary-50', 'border-0', 'text-primary-900']
  };

  const paddingClasses = {
    none: [],
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6'],
    xl: ['p-8']
  };

  const radiusClasses = {
    none: ['rounded-none'],
    sm: ['rounded-sm'],
    md: ['rounded-md'],
    lg: ['rounded-lg'],
    xl: ['rounded-xl'],
    full: ['rounded-full']
  };

  const shadowClasses = {
    none: [],
    sm: ['shadow-sm'],
    md: ['shadow-md'],
    lg: ['shadow-lg'],
    xl: ['shadow-xl']
  };

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    ...paddingClasses[padding],
    ...radiusClasses[radius],
    ...shadowClasses[shadow],
    className
  ].filter(Boolean).join(' ');

  const customStyle = customStyles ? {
    backgroundColor: customStyles.backgroundColor,
    borderColor: customStyles.borderColor,
    color: customStyles.textColor,
  } : {};

  return (
    <div className={classes} style={customStyle} {...props}>
      {children}
    </div>
  );
};
```

#### White-Label Navigation Component
```typescript
interface NavigationProps {
  brand?: {
    logo?: string;
    name?: string;
    href?: string;
  };
  items: NavigationItem[];
  variant?: 'horizontal' | 'vertical' | 'sidebar';
  position?: 'static' | 'fixed' | 'sticky';
  customStyles?: {
    backgroundColor?: string;
    textColor?: string;
    activeColor?: string;
    hoverColor?: string;
  };
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  children?: NavigationItem[];
}

const Navigation: React.FC<NavigationProps> = ({
  brand,
  items,
  variant = 'horizontal',
  position = 'static',
  customStyles
}) => {
  const baseClasses = [
    'w-full',
    'transition-all',
    'duration-200'
  ];

  const variantClasses = {
    horizontal: ['flex', 'items-center', 'justify-between', 'px-4', 'py-3'],
    vertical: ['flex', 'flex-col', 'space-y-2', 'p-4'],
    sidebar: ['flex', 'flex-col', 'h-full', 'w-64', 'p-4', 'border-r', 'border-border']
  };

  const positionClasses = {
    static: [],
    fixed: ['fixed', 'top-0', 'left-0', 'z-50'],
    sticky: ['sticky', 'top-0', 'z-40']
  };

  const navClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...positionClasses[position],
    'bg-surface',
    'border-b',
    'border-border'
  ].filter(Boolean).join(' ');

  const customStyle = customStyles ? {
    backgroundColor: customStyles.backgroundColor,
    color: customStyles.textColor,
  } : {};

  return (
    <nav className={navClasses} style={customStyle}>
      {brand && (
        <div className="flex items-center space-x-3">
          {brand.logo && (
            <img src={brand.logo} alt={brand.name} className="h-8 w-auto" />
          )}
          {brand.name && (
            <span className="text-xl font-bold text-text-primary">
              {brand.name}
            </span>
          )}
        </div>
      )}
      
      <div className={variant === 'horizontal' ? 'flex space-x-6' : 'space-y-2'}>
        {items.map((item, index) => (
          <NavigationItem
            key={index}
            item={item}
            customStyles={customStyles}
            variant={variant}
          />
        ))}
      </div>
    </nav>
  );
};

const NavigationItem: React.FC<{
  item: NavigationItem;
  customStyles?: NavigationProps['customStyles'];
  variant: NavigationProps['variant'];
}> = ({ item, customStyles, variant }) => {
  const baseClasses = [
    'flex',
    'items-center',
    'space-x-2',
    'px-3',
    'py-2',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'hover:bg-primary-50',
    'hover:text-primary-700'
  ];

  const activeClasses = item.active ? [
    'bg-primary-100',
    'text-primary-800',
    'font-medium'
  ] : [
    'text-text-secondary',
    'hover:text-text-primary'
  ];

  const classes = [...baseClasses, ...activeClasses].join(' ');

  const customStyle = customStyles ? {
    color: item.active ? customStyles.activeColor : undefined,
    ':hover': {
      color: customStyles.hoverColor,
      backgroundColor: customStyles.hoverColor + '10'
    }
  } : {};

  return (
    <a href={item.href} className={classes} style={customStyle}>
      {item.icon && <span>{item.icon}</span>}
      <span>{item.label}</span>
    </a>
  );
};
```

### 4. Theme Customization Tools

#### Theme Builder Interface
```typescript
// Theme builder for runtime customization
interface ThemeBuilderProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

const ThemeBuilder: React.FC<ThemeBuilderProps> = ({
  currentTheme,
  onThemeChange
}) => {
  const [theme, setTheme] = useState<ThemeConfig>(currentTheme);

  const updateColor = (category: string, shade: string, color: string) => {
    const updatedTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [category]: {
          ...theme.colors[category as keyof typeof theme.colors],
          [shade]: color
        }
      }
    };
    setTheme(updatedTheme);
    onThemeChange(updatedTheme);
  };

  const updateTypography = (property: string, value: string | string[]) => {
    const updatedTheme = {
      ...theme,
      typography: {
        ...theme.typography,
        [property]: value
      }
    };
    setTheme(updatedTheme);
    onThemeChange(updatedTheme);
  };

  return (
    <div className="space-y-6 p-6 bg-surface rounded-lg border border-border">
      <h3 className="text-lg font-semibold text-text-primary">Theme Customization</h3>
      
      {/* Color Customization */}
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary">Colors</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={theme.colors.primary[500]}
              onChange={(e) => updateColor('primary', '500', e.target.value)}
              className="w-full h-10 rounded border border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Secondary Color
            </label>
            <input
              type="color"
              value={theme.colors.secondary[500]}
              onChange={(e) => updateColor('secondary', '500', e.target.value)}
              className="w-full h-10 rounded border border-border"
            />
          </div>
        </div>
      </div>

      {/* Typography Customization */}
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary">Typography</h4>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Primary Font Family
          </label>
          <select
            value={theme.typography.fontFamily.sans[0]}
            onChange={(e) => updateTypography('fontFamily', {
              ...theme.typography.fontFamily,
              sans: [e.target.value, ...theme.typography.fontFamily.sans.slice(1)]
            })}
            className="w-full px-3 py-2 border border-border rounded-md"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-text-primary">Preview</h4>
        <div className="p-4 border border-border rounded-md space-y-3">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Card padding="md">
            <h5 className="text-lg font-semibold text-text-primary mb-2">Card Title</h5>
            <p className="text-text-secondary">This is a preview of how your theme will look.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
```

## White-Label Implementation Instructions

1. **Define theme configuration structure** that covers all customizable aspects
2. **Create theme provider system** that applies customizations at runtime
3. **Build flexible component library** that respects theme configurations
4. **Implement customization tools** for easy theme modification
5. **Ensure consistent behavior** across all theme variations
6. **Provide comprehensive documentation** for theme customization
7. **Test theme variations** to ensure accessibility and usability
8. **Create preset themes** for common use cases and industries
```

### Theme and Responsive Design

```markdown
# Theme and Responsive Design System

You are a responsive design specialist focused on creating adaptive, accessible design systems that work seamlessly across all devices and user preferences. Your task is to implement comprehensive theming and responsive design patterns.

## Responsive Design Architecture

### 1. Mobile-First Approach
```css
/* Base styles (mobile-first) */
.component {
  padding: var(--space-4);
  font-size: var(--font-size-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Tablet styles */
@media (min-width: 768px) {
  .component {
    padding: var(--space-6);
    font-size: var(--font-size-base);
    flex-direction: row;
    gap: var(--space-4);
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-8);
    font-size: var(--font-size-lg);
    gap: var(--space-6);
  }
}

/* Large desktop styles */
@media (min-width: 1280px) {
  .component {
    padding: var(--space-12);
    gap: var(--space-8);
  }
}
```

### 2. Fluid Typography System
```css
/* Fluid typography using clamp() and vw units */
:root {
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --font-size-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem);
  --font-size-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);
  --font-size-5xl: clamp(3rem, 2.5rem + 2.5vw, 3.75rem);
}

/* Fluid spacing system */
:root {
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --space-xl: clamp(2rem, 1.6rem + 2vw, 3rem);
  --space-2xl: clamp(3rem, 2.4rem + 3vw, 4.5rem);
  --space-3xl: clamp(4rem, 3.2rem + 4vw, 6rem);
}
```

### 3. Advanced Theme System
```css
/* Theme system with CSS custom properties */
:root {
  /* Light theme (default) */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  --color-border: #e2e8f0;
  --color-border-focus: #3b82f6;
  --color-shadow: rgba(0, 0, 0, 0.1);
  
  /* Interactive states */
  --color-interactive-hover: rgba(59, 130, 246, 0.05);
  --color-interactive-active: rgba(59, 130, 246, 0.1);
  --color-interactive-disabled: #f1f5f9;
  
  /* Semantic colors */
  --color-success: #10b981;
  --color-success-bg: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-bg: #fef3c7;
  --color-error: #ef4444;
  --color-error-bg: #fee2e2;
  --color-info: #3b82f6;
  --color-info-bg: #dbeafe;
}

/* Dark theme */
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-surface-elevated: #334155;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #94a3b8;
  --color-border: #334155;
  --color-border-focus: #60a5fa;
  --color-shadow: rgba(0, 0, 0, 0.3);
  
  --color-interactive-hover: rgba(96, 165, 250, 0.1);
  --color-interactive-active: rgba(96, 165, 250, 0.2);
  --color-interactive-disabled: #1e293b;
  
  --color-success: #34d399;
  --color-success-bg: rgba(52, 211, 153, 0.1);
  --color-warning: #fbbf24;
  --color-warning-bg: rgba(251, 191, 36, 0.1);
  --color-error: #f87171;
  --color-error-bg: rgba(248, 113, 113, 0.1);
  --color-info: #60a5fa;
  --color-info-bg: rgba(96, 165, 250, 0.1);
}

/* High contrast theme */
[data-theme="high-contrast"] {
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #000000;
  --color-text-secondary: #000000;
  --color-text-tertiary: #000000;
  --color-border: #000000;
  --color-border-focus: #0000ff;
  --color-shadow: rgba(0, 0, 0, 0.5);
  
  --color-interactive-hover: #f0f0f0;
  --color-interactive-active: #e0e0e0;
  --color-interactive-disabled: #cccccc;
  
  --color-success: #008000;
  --color-success-bg: #e6ffe6;
  --color-warning: #ff8c00;
  --color-warning-bg: #fff4e6;
  --color-error: #ff0000;
  --color-error-bg: #ffe6e6;
  --color-info: #0000ff;
  --color-info-bg: #e6e6ff;
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast preferences */
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
    --color-text-secondary: #000000;
    --color-shadow: rgba(0, 0, 0, 0.8);
  }
}

/* Color scheme preferences */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-border: #334155;
  }
}
```

### 4. Responsive Component Patterns
```typescript
// Responsive component with breakpoint hooks
import { useState, useEffect } from 'react';

interface Breakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

const useBreakpoints = (): Breakpoints => {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        xs: width >= 475,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};

// Responsive layout component
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  footer
}) => {
  const breakpoints = useBreakpoints();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-surface border-b border-border">
          <div className="container mx-auto">
            <div className="flex items-center justify-between h-16">
              {!breakpoints.lg && sidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-interactive-hover"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              {header}
            </div>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop sidebar */}
            {breakpoints.lg && (
              <aside className="w-64 bg-surface border-r border-border">
                <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                  {sidebar}
                </div>
              </aside>
            )}

            {/* Mobile sidebar overlay */}
            {!breakpoints.lg && sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black bg-opacity-50"
                  onClick={() => setSidebarOpen(false)}
                />
                <aside className="fixed left-0 top-0 z-50 w-64 h-full bg-surface border-r border-border">
                  <div className="p-4">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="mb-4 p-2 rounded-md hover:bg-interactive-hover"
                      aria-label="Close sidebar"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {sidebar}
                  </div>
                </aside>
              </>
            )}
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-surface border-t border-border">
          <div className="container mx-auto py-8">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};
```

### 5. Accessibility Integration
```css
/* Focus management */
.focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-background);
  color: var(--color-text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }
  
  .card {
    border: 1px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
  
  .transition-all {
    transition: none;
  }
}
```

## Theme and Responsive Design Instructions

1. **Implement mobile-first responsive design** with progressive enhancement for larger screens
2. **Create comprehensive theme system** supporting light, dark, and high contrast modes
3. **Use fluid typography and spacing** that scales smoothly across all screen sizes
4. **Ensure accessibility compliance** with proper focus management and screen reader support
5. **Respect user preferences** for reduced motion, high contrast, and color scheme
6. **Test across all target devices** and screen sizes to ensure consistent experience
7. **Provide theme switching functionality** for user preference management
8. **Document responsive patterns** and theme customization options
```

## Usage Instructions

1. **Analyze project requirements** to determine design system scope and customization needs
2. **Generate comprehensive design tokens** covering all visual design aspects
3. **Create component library** with white-label support and responsive behavior
4. **Implement theme system** with multiple variants and user preference support
5. **Test design system** across all target platforms and accessibility requirements
6. **Document usage guidelines** for designers and developers
7. **Provide customization tools** for easy theme modification and branding
8. **Validate accessibility compliance** throughout the design system

## Integration Points

- **Requirements Traceability**: Links back to design system requirements (13.1-13.6)
- **Component Consistency**: Ensures consistent patterns across all platforms
- **Theme Flexibility**: Supports white-label customization and branding needs
- **Responsive Design**: Works seamlessly across all target screen sizes
- **Accessibility**: Meets WCAG 2.1 AA compliance requirements
- **Documentation**: Provides comprehensive usage guidelines and examples

## Instructions

### How to Use This Design System Generation Template

1. **Assess Project Requirements**
   - Identify target platforms (web, mobile, desktop)
   - Determine branding and customization needs
   - Review accessibility requirements (WCAG 2.1 AA compliance)
   - Understand user demographics and preferences

2. **Generate Design Token Foundation**
   - Create comprehensive color palettes with semantic meanings
   - Establish typography scales with proper hierarchy
   - Define spacing systems using consistent mathematical ratios
   - Set up border radius, shadow, and other visual properties

3. **Build Component Library**
   - Start with base components (Button, Input, Card, etc.)
   - Implement consistent API patterns across all components
   - Add white-label customization support through theme props
   - Ensure responsive behavior and accessibility compliance

4. **Implement Theme System**
   - Create theme provider for runtime customization
   - Support multiple theme variants (light, dark, high contrast)
   - Implement user preference detection and respect
   - Add theme switching functionality

5. **Create Responsive Design System**
   - Use mobile-first approach with progressive enhancement
   - Implement fluid typography and spacing systems
   - Create responsive layout components and utilities
   - Test across all target screen sizes and devices

6. **Ensure Accessibility Compliance**
   - Implement proper focus management and keyboard navigation
   - Ensure sufficient color contrast ratios (4.5:1 for normal text)
   - Add screen reader support with proper ARIA attributes
   - Support user preferences for reduced motion and high contrast

7. **Document and Test**
   - Create comprehensive component documentation with examples
   - Provide usage guidelines and best practices
   - Test theme variations and responsive behavior
   - Validate accessibility compliance across all components

8. **Deploy and Maintain**
   - Package design system for distribution (npm, CDN)
   - Set up automated testing and visual regression testing
   - Create feedback mechanisms for continuous improvement
   - Maintain version control and changelog

## Examples

### Complete Design System Implementation Example

Here's a comprehensive example of implementing a design system for a SaaS task management application:

#### 1. Project Setup and Configuration
```typescript
// design-system.config.ts
export interface DesignSystemConfig {
  name: string;
  version: string;
  platforms: ('web' | 'mobile' | 'desktop')[];
  themes: ThemeConfig[];
  accessibility: {
    wcagLevel: 'AA' | 'AAA';
    supportHighContrast: boolean;
    supportReducedMotion: boolean;
  };
  customization: {
    allowColorOverrides: boolean;
    allowTypographyOverrides: boolean;
    allowSpacingOverrides: boolean;
  };
}

export const designSystemConfig: DesignSystemConfig = {
  name: 'TaskFlow Design System',
  version: '1.0.0',
  platforms: ['web', 'mobile', 'desktop'],
  themes: [
    {
      name: 'default',
      displayName: 'TaskFlow Default',
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        // ... other color definitions
      },
      typography: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          serif: ['Merriweather', 'Georgia', 'serif'],
          mono: ['JetBrains Mono', 'Consolas', 'monospace']
        }
      }
    }
  ],
  accessibility: {
    wcagLevel: 'AA',
    supportHighContrast: true,
    supportReducedMotion: true
  },
  customization: {
    allowColorOverrides: true,
    allowTypographyOverrides: true,
    allowSpacingOverrides: false
  }
};
```

#### 2. Complete Component Implementation
```typescript
// components/Button/Button.tsx
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'whitespace-nowrap',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50'
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### 3. Theme Provider Implementation
```typescript
// providers/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  customTheme?: Partial<ThemeConfig>;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customTheme?: Partial<ThemeConfig>;
  setCustomTheme: (theme: Partial<ThemeConfig>) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  setCustomTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'taskflow-ui-theme',
  customTheme,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [currentCustomTheme, setCurrentCustomTheme] = useState<Partial<ThemeConfig> | undefined>(customTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // Apply custom theme properties
    if (currentCustomTheme) {
      const root = window.document.documentElement;
      
      if (currentCustomTheme.colors?.primary) {
        Object.entries(currentCustomTheme.colors.primary).forEach(([key, value]) => {
          root.style.setProperty(`--primary-${key}`, value);
        });
      }
      
      if (currentCustomTheme.typography?.fontFamily?.sans) {
        root.style.setProperty('--font-sans', currentCustomTheme.typography.fontFamily.sans.join(', '));
      }
    }
  }, [currentCustomTheme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    customTheme: currentCustomTheme,
    setCustomTheme: setCurrentCustomTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
```

#### 4. Responsive Layout System
```typescript
// components/Layout/ResponsiveLayout.tsx
import React, { useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Button } from '../Button/Button';
import { cn } from '../../utils/cn';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            {sidebar && !isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            )}
            <div className="flex flex-1 items-center justify-between space-x-2">
              {header}
            </div>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && isDesktop && (
          <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r bg-background">
            <div className="py-6 pr-6 lg:py-8">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebar && !isDesktop && sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-background border-r shadow-lg">
              <div className="flex h-14 items-center border-b px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
              <div className="py-6 pr-6">
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 overflow-x-hidden',
          isDesktop && sidebar && 'ml-64'
        )}>
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="border-t bg-background">
          <div className="container py-6">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};
```

#### 5. Complete Usage Example
```typescript
// App.tsx - Complete application setup
import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { ResponsiveLayout } from './components/Layout/ResponsiveLayout';
import { Button } from './components/Button/Button';
import { Input } from './components/Input/Input';
import { Card } from './components/Card/Card';
import { useTheme } from './providers/ThemeProvider';

// Theme switcher component
const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('light')}
      >
        Light
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('dark')}
      >
        Dark
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('system')}
      >
        System
      </Button>
    </div>
  );
};

// Main application header
const AppHeader: React.FC = () => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center space-x-4">
      <h1 className="text-xl font-semibold">TaskFlow</h1>
    </div>
    <div className="flex items-center space-x-4">
      <ThemeSwitcher />
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </div>
  </div>
);

// Sidebar navigation
const AppSidebar: React.FC = () => (
  <nav className="space-y-2">
    <Button variant="ghost" className="w-full justify-start">
      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
      Dashboard
    </Button>
    <Button variant="ghost" className="w-full justify-start">
      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
      Tasks
    </Button>
    <Button variant="ghost" className="w-full justify-start">
      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
      Team
    </Button>
  </nav>
);

// Main content area
const AppContent: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome back! Here's what's happening with your tasks today.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Total Tasks</h3>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+2 from yesterday</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Completed</h3>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground">+4 from yesterday</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">In Progress</h3>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground">-2 from yesterday</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Overdue</h3>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">2</div>
          <p className="text-xs text-muted-foreground">Same as yesterday</p>
        </div>
      </Card>
    </div>

    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Add Task</h3>
      <div className="flex space-x-2">
        <Input
          placeholder="What needs to be done?"
          className="flex-1"
        />
        <Button>Add Task</Button>
      </div>
    </Card>
  </div>
);

// Main App component
const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="taskflow-theme">
      <ResponsiveLayout
        header={<AppHeader />}
        sidebar={<AppSidebar />}
      >
        <AppContent />
      </ResponsiveLayout>
    </ThemeProvider>
  );
};

export default App;
```

This comprehensive example demonstrates a complete design system implementation with:

- **Comprehensive token system** with colors, typography, spacing, and other design primitives
- **Flexible component library** with consistent APIs and white-label support
- **Advanced theming system** with light/dark modes and user preference detection
- **Responsive layout system** that adapts to different screen sizes
- **Accessibility compliance** with proper focus management and ARIA attributes
- **Real-world usage patterns** showing how components work together in an application

The design system is production-ready and can be easily customized for different brands while maintaining consistency and accessibility standards.
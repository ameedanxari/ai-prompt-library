# Stage 07 - Deployment (Web Applications)

## Purpose
Configure and deploy web applications with optimized performance, security, and scalability. This stage focuses on CDN setup, static site hosting, serverless functions, and web-specific deployment strategies for production environments.

## Instructions

### How to Use This Stage

1. **Review Web Architecture**: Confirm the web application architecture and deployment requirements
2. **Select Hosting Platform**: Choose appropriate hosting platform based on application type and requirements
3. **Configure CDN**: Set up content delivery network for optimal performance
4. **Implement Security**: Configure SSL certificates, security headers, and CSP policies
5. **Optimize Performance**: Implement caching strategies, compression, and asset optimization
6. **Set Up Monitoring**: Configure performance monitoring and error tracking
7. **Test Deployment**: Verify deployment works correctly across different environments
8. **Document Procedures**: Create deployment runbooks and troubleshooting guides

### Prerequisites

- Completed Stage 06 (Implementation) with working web application
- Domain name registered and DNS configured
- Cloud provider accounts set up (AWS, Vercel, Netlify, etc.)
- SSL certificates obtained or configured for automatic provisioning
- Performance testing tools configured

### Stage Execution Steps

1. **Infrastructure Setup**: Configure hosting platform and CDN
2. **Security Configuration**: Implement SSL, security headers, and CSP
3. **Performance Optimization**: Set up caching, compression, and asset optimization
4. **Deployment Pipeline**: Create automated deployment workflows
5. **Monitoring Setup**: Configure performance and error monitoring
6. **Testing and Validation**: Verify deployment meets performance and security requirements

## Examples

### Example 1: React SPA Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Configure project
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/\$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

# Deploy to production
vercel --prod
```

### Example 2: Next.js Application with API Routes

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

### Example 3: Static Site with Netlify Functions

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
```

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  
  try {
    // API logic here
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'API response' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
```

### Example 4: AWS S3 + CloudFront Deployment

```bash
# Build and deploy script
#!/bin/bash
set -e

# Build the application
npm run build

# Sync to S3
aws s3 sync build/ s3://my-app-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"

echo "Deployment complete!"
```

```hcl
# terraform/cloudfront.tf
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }
  
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}
```

## Overview
This stage configures web-specific deployment infrastructure, focusing on CDN setup, static site hosting, serverless functions, and web performance optimization for production environments.

## Scope
- Static site hosting and CDN configuration
- Serverless function deployment
- Web-specific security headers and policies
- Performance optimization and caching strategies
- SSL/TLS certificate management

## Web Deployment Architecture

### 1. Static Site Hosting Strategies

#### JAMstack Deployment (Recommended)
```markdown
## JAMstack Architecture Benefits
- **Performance**: Pre-built static files served from CDN
- **Security**: Reduced attack surface with static files
- **Scalability**: Global CDN distribution handles traffic spikes
- **Cost-Effective**: Minimal server infrastructure required
- **Developer Experience**: Simple deployment workflows

## Hosting Platform Comparison

### Vercel
**Best for**: Next.js, React, Vue.js applications
- **Features**: Automatic deployments, edge functions, analytics
- **Pricing**: Generous free tier, pay-per-use scaling
- **Integration**: Excellent GitHub/GitLab integration

### Netlify
**Best for**: Static sites, serverless functions, form handling
- **Features**: Branch previews, form handling, identity management
- **Pricing**: Free tier available, usage-based pricing
- **Integration**: Git-based deployment workflow

### AWS S3 + CloudFront
**Best for**: Enterprise applications, custom requirements
- **Features**: Full AWS ecosystem integration, custom configurations
- **Pricing**: Pay-as-you-go, predictable costs at scale
- **Integration**: Terraform/CloudFormation automation

### Azure Static Web Apps
**Best for**: Microsoft ecosystem, enterprise integration
- **Features**: Integrated authentication, API routes, staging environments
- **Pricing**: Free tier, pay-per-use scaling
- **Integration**: Azure DevOps and GitHub Actions
```

#### Vercel Deployment Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

#### Netlify Deployment Configuration
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[dev]
  command = "npm run dev"
  port = 3000
  publish = "dist"
```

### 2. CDN and Caching Configuration

#### CloudFront Configuration (AWS)
```hcl
# cloudfront.tf
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.app_name}-${var.environment}"
}

resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  # API origin
  origin {
    domain_name = "api.example.com"
    origin_id   = "API"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  # Default cache behavior for static assets
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]
      
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  # API cache behavior
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "API"
    compress               = true
    viewer_protocol_policy = "https-only"
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Origin", "Accept"]
      
      cookies {
        forward = "all"
      }
    }
    
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }
  
  # Static assets cache behavior
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 31536000
    default_ttl = 31536000
    max_ttl     = 31536000
  }
  
  price_class = var.environment == "prod" ? "PriceClass_All" : "PriceClass_100"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-cdn"
    Environment = var.environment
  }
}
```

### 3. SSL/TLS Certificate Management

#### AWS Certificate Manager Configuration
```hcl
# ssl.tf
resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-cert"
    Environment = var.environment
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
```

### 4. Serverless Function Deployment

#### Vercel Functions
```javascript
// api/hello.js
export default function handler(req, res) {
  const { method } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (method === 'GET') {
    res.status(200).json({ message: 'Hello from Vercel!' });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

#### Netlify Functions
```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  const { httpMethod, headers, body } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }
  
  if (httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Hello from Netlify!' }),
    };
  }
  
  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
```

#### AWS Lambda Functions
```javascript
// lambda/hello.js
exports.handler = async (event, context) => {
  const { httpMethod, headers, body } = event;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }
  
  try {
    if (httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: 'Hello from AWS Lambda!',
          timestamp: new Date().toISOString(),
        }),
      };
    }
    
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (error) {
    console.error('Lambda error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
```

### 5. Web Performance Optimization

#### Build Optimization Configuration
```javascript
// webpack.config.js (if using custom webpack)
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      clean: true,
    },
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction,
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      }),
      ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []),
    ],
    
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        },
      ],
    },
  };
};
```

#### Service Worker Configuration
```javascript
// public/sw.js
const CACHE_NAME = 'app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## Web Deployment Procedures

### 1. Pre-Deployment Web Checklist
```markdown
## Web-Specific Pre-Deployment Checks

### Performance
- [ ] Bundle size is optimized (< 250KB gzipped for main bundle)
- [ ] Images are optimized and use modern formats (WebP, AVIF)
- [ ] Fonts are preloaded and use font-display: swap
- [ ] Critical CSS is inlined
- [ ] Lighthouse performance score > 90

### SEO and Accessibility
- [ ] Meta tags are properly configured
- [ ] Open Graph and Twitter Card metadata present
- [ ] Structured data markup implemented
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] All images have alt text

### Security
- [ ] Content Security Policy configured
- [ ] Security headers implemented
- [ ] HTTPS enforced with HSTS
- [ ] No sensitive data in client-side code
- [ ] Third-party scripts are from trusted sources

### Browser Compatibility
- [ ] Tested on latest 2 versions of major browsers
- [ ] Polyfills included for required features
- [ ] Graceful degradation for unsupported features
- [ ] Mobile responsiveness verified
```

### 2. Deployment Automation
```yaml
# .github/workflows/web-deploy.yml
name: Deploy Web Application

on:
  push:
    branches: [main, develop]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          REACT_APP_API_URL: ${{ secrets.API_URL }}
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 3. Performance Monitoring
```javascript
// src/performance.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Send to custom analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metric: metric.name,
      value: metric.value,
      id: metric.id,
      timestamp: Date.now(),
    }),
  }).catch(console.error);
}

// Measure and report Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Performance observer for custom metrics
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        sendToAnalytics({
          name: 'page-load-time',
          value: entry.loadEventEnd - entry.fetchStart,
          id: 'page-load',
        });
      }
    });
  });
  
  observer.observe({ entryTypes: ['navigation'] });
}
```

## Integration Points

### Previous Stage Dependencies
- **Stage 06 (Implementation)**: Complete web application build
- **Testing**: All web-specific tests passing
- **Assets**: Optimized images, fonts, and static assets

### Next Stage Deliverables
- **Live Web Application**: Deployed and accessible web application
- **CDN Configuration**: Optimized content delivery setup
- **SSL Certificates**: Secure HTTPS configuration
- **Performance Monitoring**: Real-time performance tracking
- **Deployment Documentation**: Web-specific deployment procedures

## Success Criteria
- Web application is accessible and performs well globally
- Core Web Vitals meet Google's recommended thresholds
- SSL/TLS certificates are properly configured
- CDN is optimized for performance and cost
- Automated deployment pipeline is reliable and fast

## Risk Mitigation
- **CDN Failures**: Multiple CDN providers or fallback strategies
- **SSL Certificate Expiry**: Automated certificate renewal
- **Performance Regression**: Continuous performance monitoring
- **Deployment Failures**: Automated rollback procedures
- **Security Vulnerabilities**: Regular security scans and updates
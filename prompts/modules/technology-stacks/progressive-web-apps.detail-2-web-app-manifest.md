### Web App Manifest

```json
{
  "name": "Progressive Web App",
  "short_name": "PWA",
  "description": "A comprehensive Progressive Web App with offline capabilities",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2196F3",
  "background_color": "#ffffff",
  "lang": "en-US",
  "dir": "ltr",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/static/images/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/static/images/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/static/images/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile view of the application"
    },
    {
      "src": "/static/images/screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop view of the application"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your dashboard",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/static/images/dashboard-icon.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Profile",
      "short_name": "Profile",
      "description": "View your profile",
      "url": "/profile",
      "icons": [
        {
          "src": "/static/images/profile-icon.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "files",
          "accept": ["image/*", "text/*"]
        }
      ]
    }
  },
  "protocol_handlers": [
    {
      "protocol": "web+pwa",
      "url": "/handle?url=%s"
    }
  ]
}
```


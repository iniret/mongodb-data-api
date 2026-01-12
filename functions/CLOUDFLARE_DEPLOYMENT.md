# Cloudflare Worker Beacon Deployment Guide

## Prerequisites

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

## Configuration

1. Update `wrangler.toml` with your actual Data API URL:
   ```toml
   [env.production]
   vars = { DATA_API_URL = "https://your-actual-data-api-domain.com" }
   ```

2. Set your API key as a secret:
   ```bash
   wrangler secret put API_KEY
   # Enter your API key when prompted
   ```

## Deployment

1. Deploy to Cloudflare Workers:
   ```bash
   # Deploy to development
   wrangler deploy --env development

   # Deploy to production
   wrangler deploy --env production
   ```

## Usage

The beacon worker accepts both GET and POST requests:

### GET Request
```
https://your-worker.your-subdomain.workers.dev/?type=page_view&page=home
```

### POST Request
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"type": "button_click", "element": "signup", "page": "landing"}'
```

## Features

- **CORS Support**: Automatically handles CORS headers
- **Flexible Input**: Accepts both GET query parameters and POST JSON body
- **Cloudflare Integration**: Captures CF-specific headers and geolocation data
- **Error Handling**: Robust error handling with proper HTTP status codes
- **Default Values**: Automatically sets default type if not provided
- **Header Filtering**: Only captures safe, non-sensitive headers

## Environment Variables

- `DATA_API_URL`: URL of your MongoDB Data API service
- `API_KEY`: Authentication key for the Data API (set as secret)

## Data Structure

The beacon captures:
- `type`: Event type (defaults to "faq")
- `eventTime`: ISO timestamp
- `headers`: Filtered request headers
- `cf`: Cloudflare-specific data (country, city, timezone, ASN)
- Any additional data from query params or POST body
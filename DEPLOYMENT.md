# Deployment Guide

## Server Deployment Options

### 1. Traditional Server Deployment

#### Prerequisites
- Node.js 18+ installed
- MongoDB connection string
- PM2 (recommended for production)

#### Steps
1. Clone the repository:
```bash
git clone https://github.com/abhishekmongoDB/data-api-alternative.git
cd data-api-alternative
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Install PM2 globally:
```bash
npm install -g pm2
```

5. Start with PM2:
```bash
pm2 start index.js --name "data-api"
pm2 save
pm2 startup
```

### 2. Docker Deployment

#### Build and run with Docker:
```bash
# Build the image
docker build -t data-api .

# Run the container
docker run -d \
  --name data-api \
  -p 7438:7438 \
  --env-file .env \
  data-api
```

#### Or use Docker Compose:
```bash
docker-compose up -d
```

### 3. Cloud Deployment

#### Vercel (Serverless)
- Already configured with `vercel.json`
- Set environment variables in Vercel dashboard
- Deploy: `vercel --prod`

#### AWS EC2
1. Launch EC2 instance (Ubuntu/Amazon Linux)
2. Install Node.js and PM2
3. Clone repository and follow traditional deployment steps
4. Configure security groups (port 7438)
5. Set up Elastic IP for static IP address

#### DigitalOcean Droplet
1. Create droplet with Node.js
2. Follow traditional deployment steps
3. Configure firewall rules
4. Use droplet's public IP address

## Environment Variables

Required variables for production:
```
PORT=7438
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net
API_KEY=your_secure_api_key
API_SECRET=your_secure_api_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_MESSAGE=Too many requests, please try again later.
ALLOWED_ORIGINS=https://yourdomain.com,https://anotherdomain.com
```

## Security Checklist

- [ ] Use strong API keys and secrets
- [ ] Configure CORS properly
- [ ] Set up HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## Monitoring

### Health Check
The API includes a health check endpoint:
```
GET /health
```

### PM2 Monitoring
```bash
pm2 status
pm2 logs data-api
pm2 monit
```

### Docker Health Check
```bash
docker ps
docker logs <container-id>
```

## Exposing Your API for External Access

### 1. Server Configuration

#### Ubuntu/Debian Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Allow port through firewall
sudo ufw allow 7438
sudo ufw enable
```

#### CentOS/RHEL/Amazon Linux
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Configure firewall
sudo firewall-cmd --permanent --add-port=7438/tcp
sudo firewall-cmd --reload
```

### 2. Cloud Provider Specific Setup

#### AWS EC2
1. **Security Group Configuration:**
   - Go to EC2 Console → Security Groups
   - Edit inbound rules for your instance
   - Add rule: Type: Custom TCP, Port: 7438, Source: 0.0.0.0/0 (or specific IPs)

2. **Get your public IP:**
   ```bash
   curl http://checkip.amazonaws.com
   ```

3. **Access your API:**
   ```
   http://YOUR_EC2_PUBLIC_IP:7438/health
   ```

#### DigitalOcean Droplet
1. **Firewall Configuration:**
   ```bash
   # Allow HTTP traffic on port 7438
   sudo ufw allow 7438/tcp
   ```

2. **Get your public IP:**
   ```bash
   curl -4 icanhazip.com
   ```

3. **Access your API:**
   ```
   http://YOUR_DROPLET_IP:7438/health
   ```

#### Google Cloud Platform (GCP)
1. **Firewall Rule:**
   ```bash
   gcloud compute firewall-rules create allow-data-api \
     --allow tcp:7438 \
     --source-ranges 0.0.0.0/0 \
     --description "Allow Data API access"
   ```

2. **Get external IP:**
   ```bash
   gcloud compute instances describe YOUR_INSTANCE_NAME \
     --zone=YOUR_ZONE \
     --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
   ```

### 3. Domain Setup (Optional but Recommended)

#### Using Nginx as Reverse Proxy
1. **Install Nginx:**
   ```bash
   sudo apt install nginx  # Ubuntu/Debian
   sudo yum install nginx  # CentOS/RHEL
   ```

2. **Create Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/data-api
   ```

3. **Add configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:7438;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/data-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### SSL Certificate with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Testing External Access

#### Basic Health Check
```bash
# Replace YOUR_SERVER_IP with your actual server IP
curl http://YOUR_SERVER_IP:7438/health
```

#### Test API Endpoint
```bash
curl -X POST http://YOUR_SERVER_IP:7438/api/findOne \
-H "Content-Type: application/json" \
-H "x-api-key: your_api_key_here" \
-H "x-api-secret: your_api_secret_here" \
-d '{
  "database": "test",
  "collection": "users",
  "filter": {}
}'
```

### 5. Production URLs

After deployment, your API will be accessible at:

- **Direct IP Access:** `http://YOUR_SERVER_IP:7438`
- **With Domain:** `http://your-domain.com` (if using Nginx)
- **With SSL:** `https://your-domain.com` (if using SSL)

#### API Endpoints:
- Health Check: `GET /health`
- Insert One: `POST /api/insertOne`
- Find One: `POST /api/findOne`
- Find Many: `POST /api/find`
- Update One: `POST /api/updateOne`
- Delete One: `POST /api/deleteOne`
- Aggregate: `POST /api/aggregate`

### 6. Client Integration Examples

#### JavaScript/Node.js
```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:7438';
const API_KEY = 'your_api_key_here';
const API_SECRET = 'your_api_secret_here';

async function findDocument(database, collection, filter) {
  const response = await fetch(`${API_BASE_URL}/api/findOne`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-api-secret': API_SECRET
    },
    body: JSON.stringify({
      database,
      collection,
      filter
    })
  });
  
  return response.json();
}
```

#### Python
```python
import requests

API_BASE_URL = 'http://YOUR_SERVER_IP:7438'
API_KEY = 'your_api_key_here'
API_SECRET = 'your_api_secret_here'

def find_document(database, collection, filter_obj):
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET
    }
    
    data = {
        'database': database,
        'collection': collection,
        'filter': filter_obj
    }
    
    response = requests.post(f'{API_BASE_URL}/api/findOne', 
                           headers=headers, 
                           json=data)
    return response.json()
```

### 7. Troubleshooting External Access

#### Common Issues:
1. **Connection Refused:**
   - Check if service is running: `pm2 status`
   - Verify port binding: `netstat -tlnp | grep 7438`

2. **Firewall Blocking:**
   - Check firewall status: `sudo ufw status`
   - Verify cloud provider security groups

3. **DNS Issues:**
   - Test with IP directly first
   - Check domain DNS settings

4. **SSL Certificate Issues:**
   - Verify certificate: `sudo certbot certificates`
   - Check Nginx configuration: `sudo nginx -t`
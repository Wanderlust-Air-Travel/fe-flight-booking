# Deployment Guide — fe-flight-booking (Next.js Frontend)

## Table of Contents

1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Environment Variables](#environment-variables)
4. [Local Development](#local-development)
5. [Docker Production Setup](#docker-production-setup)
6. [Production Deployment on VPS](#production-deployment-on-vps)
7. [Cloudflare Tunnel](#cloudflare-tunnel)
8. [CI/CD with Jenkins](#cicd-with-jenkins)
9. [Health Checks & Monitoring](#health-checks--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The frontend is a **Next.js 16.0.1** application with React 19, built with:
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **Zustand** for state management
- **Next.js App Router** for routing
- **Docker** for production deployment

---

## Repository Structure

```
fe-flight-booking/
├── app/                    # Next.js App Router pages
│   ├── (page)/            # Public pages
│   ├── api/               # API routes (BFF pattern)
│   └── layout.tsx         # Root layout
├── components/            # Shared UI components (shadcn/ui + custom)
├── lib/                   # Utilities, API client, toast helpers
├── store/                 # Zustand stores
├── public/                # Static assets
├── docs/                  # Documentation
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml     # Docker production setup
├── .env.example           # Template with all variables
└── .env.local            # Local development overrides (gitignored)
```

---

## Environment Variables

The FE uses a **single `.env` file** with environment-specific values controlled by comments. For each environment, uncomment the relevant values and comment out others.

### `.env` — All Environments (Single File)

```bash
# =============================================================================
# Flight Booking Frontend — Environment Configuration
#
# USAGE: For each environment, UNCOMMENT the relevant values below and
#        COMMENT OUT values from other environments.
#
# Development  → uncomment "Development" section
# Staging     → uncomment "Staging" section
# Production  → uncomment "Production" section
#
# NEXT_PUBLIC_* variables are exposed to the browser (client-side).
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# COMMON (always active)
# ─────────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=Flight Booking

# ─────────────────────────────────────────────────────────────────────────────
# DEVELOPMENT
# Local: http://localhost:3000 (FE) | http://localhost:8080 (BE)
# ─────────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_PAYMENT_MODE=mock

# Payment Provider (mock only for development)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Analytics (development)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=

# ─────────────────────────────────────────────────────────────────────────────
# STAGING
# Deploy on staging VPS: https://staging.yourdomain.com
# ─────────────────────────────────────────────────────────────────────────────
# NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
# API_URL=https://api-staging.yourdomain.com
# NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
# NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
# NEXT_PUBLIC_NODE_ENV=staging
# NEXT_PUBLIC_PAYMENT_MODE=mock
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=

# ─────────────────────────────────────────────────────────────────────────────
# PRODUCTION
# Deploy on production VPS: https://www.yourdomain.com
# ─────────────────────────────────────────────────────────────────────────────
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# API_URL=https://api.yourdomain.com
# NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
# NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
# NEXT_PUBLIC_NODE_ENV=production
# NEXT_PUBLIC_PAYMENT_MODE=stripe
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxxx
```

### Quick Reference: Environment Variables by Environment

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | `https://api-staging.yourdomain.com` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://staging.yourdomain.com` | `https://www.yourdomain.com` |
| `NEXT_PUBLIC_NODE_ENV` | `development` | `staging` | `production` |
| `NEXT_PUBLIC_PAYMENT_MODE` | `mock` | `mock` | `stripe` |
| `NEXT_PUBLIC_APP_NAME` | `Flight Booking (Dev)` | `Flight Booking (Staging)` | `Flight Booking` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | _(none)_ | `G-XXXXXXXXXX` | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | _(none)_ | Sentry DSN | Sentry DSN |

> **Note**: Variables prefixed with `NEXT_PUBLIC_` are bundled into the client-side JavaScript and are publicly visible. Never store sensitive secrets (API keys, passwords) with this prefix.

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# 1. Navigate to FE directory
cd fe-flight-booking

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start development server
npm run dev
# Opens at http://localhost:3001
```

### Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3001) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Docker Production Setup

### `Dockerfile`

The production Dockerfile uses a multi-stage build:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Uncomment for Next.js standalone output (preferred)
# ENV NEXT_TELEMETRY_DISABLED=1
# RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### `docker-compose.yml`

Create this in `fe-flight-booking/docker-compose.yml`:

```yaml
# =============================================================================
# Flight Booking Frontend — Production Docker Compose
# fe-flight-booking/
# Usage:
#   Production: docker compose up -d
# =============================================================================

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fb-frontend
    image: flight-booking/frontend:${VERSION:-latest}
    restart: unless-stopped
    ports:
      - "${FE_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      NEXT_TELEMETRY_DISABLED: "1"
      # API URL passed at runtime
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:8080}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
      NEXT_PUBLIC_NODE_ENV: ${NODE_ENV:-production}
      NEXT_PUBLIC_PAYMENT_MODE: ${NEXT_PUBLIC_PAYMENT_MODE:-stripe}
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

networks:
  default:
    name: flight-booking-net
    driver: bridge
```

> **Note**: This FE container is on the same Docker network (`flight-booking-net`) as the BE containers. Use internal Docker DNS names for BE communication instead of `localhost`.

---

## Production Deployment on VPS

### Step 1: Initial VPS Setup

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install prerequisites
apt install -y curl git unzip ufw fail2ban

# Create deploy user
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
su - deploy

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose plugin
apt install -y docker-compose-plugin
```

### Step 2: Clone Repository

```bash
# As deploy user on VPS
cd ~
mkdir -p ~/flight-booking
cd ~/flight-booking

# Clone FE
git clone https://github.com/YOUR_USERNAME/fe-flight-booking.git ./fe

# Directory structure
# ~/flight-booking/
#   ├── be/
#   │   └── .env
#   └── fe/
#       ├── src/
#       ├── Dockerfile
#       ├── docker-compose.yml
#       └── .env            ← configure this for production
```

### Step 3: Configure Environment

```bash
cd ~/flight-booking/fe

# Create .env (production section uncommented)
cat > .env << 'EOF'
NEXT_PUBLIC_APP_NAME=Flight Booking

# ─── PRODUCTION (uncomment for production) ─────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
NEXT_PUBLIC_APP_URL=https://www.yourdomain.com
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_PAYMENT_MODE=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxxx

# ─── STAGING (comment out when using production) ─────────────────────────────
# NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
# API_URL=https://api-staging.yourdomain.com
# NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
# NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
# NEXT_PUBLIC_NODE_ENV=staging
# NEXT_PUBLIC_PAYMENT_MODE=mock
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_SENTRY_DSN=

# ─── DEVELOPMENT (comment out when deploying) ─────────────────────────────────
# NEXT_PUBLIC_API_URL=http://localhost:8080
# API_URL=http://localhost:8080
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXT_PUBLIC_NODE_ENV=development
# NEXT_PUBLIC_PAYMENT_MODE=mock
EOF

chmod 600 .env
```

### Step 4: Build and Deploy

```bash
cd ~/flight-booking/fe

# Build Docker image
docker compose build --build-arg VERSION=$(git rev-parse --short HEAD)

# Start service
docker compose up -d

# Check status
docker compose ps

# Check health
curl http://localhost:3000/healthz

# View logs
docker compose logs -f

# Restart
docker compose restart
```

> **Important**: If BE and FE are on the same VPS, add the FE container to the BE's Docker network so they can communicate:

```bash
# On the BE server, connect FE to the BE network
docker network connect flight-booking-net fb-frontend
```

Or update `fe-flight-booking/docker-compose.yml` to use the external network:

```yaml
networks:
  default:
    external:
      name: flight-booking-net
```

---

## Cloudflare Tunnel

### Step 1: Install cloudflared

```bash
# On VPS
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
cloudflared --version
```

### Step 2: Create Tunnel (Cloudflare Dashboard)

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
2. Networks → Tunnels → Create a tunnel
3. Select **Cloudflared** as the connector
4. Name it: `flight-booking-fe`
5. Copy the tunnel token

### Step 3: Configure Tunnel

```bash
# On VPS
mkdir -p /etc/cloudflared
cat > /etc/cloudflared/config.yml << 'EOF'
# Staging Tunnel
tunnel: YOUR_STAGING_TUNNEL_ID
credentials-file: /etc/cloudflared/credentials.json

ingress:
  # Frontend
  - hostname: staging.yourdomain.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s

  # Backend API Gateway
  - hostname: api-staging.yourdomain.com
    service: http://localhost:8080
    originRequest:
      noTLSVerify: false

  # RabbitMQ Management
  - hostname: rabbitmq-staging.yourdomain.com
    service: http://localhost:15672

  - service: http_status:404
EOF
```

For production:

```bash
cat > /etc/cloudflared/config.prod.yml << 'EOF'
# Production Tunnel
tunnel: YOUR_PROD_TUNNEL_ID
credentials-file: /etc/cloudflared/credentials-prod.json

ingress:
  - hostname: www.yourdomain.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s

  - hostname: api.yourdomain.com
    service: http://localhost:8080
    originRequest:
      noTLSVerify: false

  - service: http_status:404
EOF
```

### Step 4: Run as Systemd Service

```bash
# Create systemd service
cat > /etc/systemd/system/cloudflared.service << 'EOF'
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel run --config /etc/cloudflared/config.yml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl enable cloudflared
systemctl start cloudflared
systemctl status cloudflared
```

### Step 5: DNS Routing (Cloudflare Dashboard)

In Cloudflare dashboard → DNS:
- `staging.yourdomain.com` → CNAME → `YOUR_TUNNEL_ID.cfargotunnel.com`
- `www.yourdomain.com` → CNAME → `YOUR_TUNNEL_ID.cfargotunnel.com`
- `api-staging.yourdomain.com` → CNAME → `YOUR_TUNNEL_ID.cfargotunnel.com`
- `api.yourdomain.com` → CNAME → `YOUR_TUNNEL_ID.cfargotunnel.com`

---

## CI/CD with Jenkins

### Create `Jenkinsfile` in `fe-flight-booking/`

```groovy
pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_IMAGE = 'flight-booking/frontend'
        APP_NAME = 'flight-booking-fe'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.VERSION = env.GIT_COMMIT_SHORT
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    def imageName = "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.VERSION}"
                    sh """
                        docker build \
                            --build-arg VERSION=${env.VERSION} \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            -t ${imageName} \
                            -t ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:latest \
                            .
                        docker push ${imageName}
                        docker push ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sshagent(credentials: ['staging-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no deploy@staging-server \'
                            cd ~/flight-booking/fe && \
                            echo "NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com" > .env && \
                            echo "NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com" >> .env && \
                            echo "NEXT_PUBLIC_NODE_ENV=staging" >> .env && \
                            echo "NEXT_PUBLIC_PAYMENT_MODE=mock" >> .env && \
                            docker compose pull && \
                            docker compose up -d --build
                        \'
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                sshagent(credentials: ['prod-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no deploy@prod-server \'
                            cd ~/flight-booking/fe && \
                            echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env && \
                            echo "NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com" >> .env && \
                            echo "NEXT_PUBLIC_NODE_ENV=production" >> .env && \
                            echo "NEXT_PUBLIC_PAYMENT_MODE=stripe" >> .env && \
                            docker compose pull && \
                            docker compose up -d --build
                        \'
                    '''
                }
                input message: 'Deploy to production?', ok: 'Deploy'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Frontend deployed successfully!"
        }
        failure {
            echo "Build or deployment failed!"
        }
    }
}
```

---

## Health Checks & Monitoring

### Health Endpoint

Add a `healthz` route to your Next.js app. Create `src/app/healthz/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
```

Then update the Dockerfile healthcheck:

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3000/healthz"]
```

### Health Check Commands

```bash
# Check frontend
curl http://localhost:3000/healthz

# Check with external URL
curl https://www.yourdomain.com/healthz
```

### Uptime Monitoring

Use **Cloudflare Analytics** or a free uptime service:
- [UptimeRobot](https://uptimerobot.com) (free tier: 50 monitors)
- [Better Uptime](https://betterstack.com/uptime) (free tier: 10 monitors)

Configure alerts for:
- HTTP 5xx responses
- Response time > 3 seconds
- SSL certificate expiry

---

## Troubleshooting

### Common Issues

**Build fails with Node version mismatch**
```bash
# Check Node version
node --version

# Ensure Dockerfile uses correct version
# FROM node:20-alpine
```

**NEXT_PUBLIC_ variables not updating**
```bash
# These are baked at BUILD time, not runtime
# You must rebuild the Docker image after changing .env
docker compose build --no-cache
docker compose up -d
```

**CORS errors in production**
```bash
# Verify BE CORS_ALLOWED_ORIGINS includes your FE domain
# On BE:
docker compose exec api-gateway env | grep CORS

# Should include: https://www.yourdomain.com
```

**Page loads but API calls fail**
```bash
# Check if FE can reach BE (same Docker network)
docker exec fb-frontend wget -qO- http://api-gateway:8080/healthz

# Check NEXT_PUBLIC_API_URL
docker exec fb-frontend env | grep NEXT_PUBLIC_API
```

**404 on static assets**
```bash
# Check public directory is copied
docker exec fb-frontend ls -la /app/public

# Check .next/static is copied
docker exec fb-frontend ls -la /app/.next/static
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] `.env` configured with correct environment values
- [ ] All other environment sections commented out
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set (production)
- [ ] Domain DNS pointing to Cloudflare
- [ ] SSL certificates active

### Post-Deployment
- [ ] Health endpoint returns 200
- [ ] Frontend loads correctly
- [ ] API calls to backend succeed
- [ ] Payment flow works (if in production)
- [ ] Responsive on mobile devices
- [ ] Lighthouse score > 90

### Environment Transition Checklist

When moving from staging to production:
- [ ] `NEXT_PUBLIC_API_URL` → production BE domain
- [ ] `NEXT_PUBLIC_SITE_URL` → production domain
- [ ] `NEXT_PUBLIC_NODE_ENV` → `production`
- [ ] `NEXT_PUBLIC_PAYMENT_MODE` → `stripe`
- [ ] Stripe publishable key → live key
- [ ] GA measurement ID → production ID
- [ ] Sentry DSN → production DSN
- [ ] Rebuild Docker image: `docker compose build --no-cache`

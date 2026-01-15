#!/bin/bash
# Quick VPS deployment script - run this on VPS directly

set -e

cd /root/bingo2026

echo "🔄 Pulling latest code..."
git pull origin main

echo "🛑 Stopping old services..."
pm2 stop all || true

echo "🗄️ Starting database services..."
docker compose -f docker-compose.app.yml up -d postgres redis

echo "⏳ Waiting for databases to be ready..."
sleep 15

echo "🔄 Running migrations..."
cd bingo-backend
DATABASE_URL="postgresql://postgres:I9C0IcT88GdZDYLkwzF0zPskQqVwqBk8@localhost:5432/bingo_party?schema=public" npx prisma migrate deploy
cd ..

echo "📦 Building backend..."
cd bingo-backend
npm run build
cd ..

echo "📦 Building frontend..."
cd bingo-frontend
VITE_API_BASE_URL=/api npm run build
cd ..

echo "🚀 Starting backend with PM2..."
cd bingo-backend
pm2 delete bingo-backend || true
pm2 start dist/main.js --name bingo-backend -i 2 --env production

# Create PM2 ecosystem file with proper env vars
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'bingo-backend',
    script: './dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8001,
      WEBSOCKET_PORT: 8002,
      DATABASE_URL: 'postgresql://postgres:I9C0IcT88GdZDYLkwzF0zPskQqVwqBk8@localhost:5432/bingo_party?schema=public',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: 'u67nQkPqDQPSvAj6iEUV5iOqEjcv2F0v',
      JWT_SECRET: 'FiVhE8vTexVmTDi1sfNzBL3iFn3hQkv0qL3sZ2s7cKhgPL4p0MJAR2j60f0UFAN2Jjwe5yAmoNMOVumOMQ',
      REFRESH_TOKEN_SECRET: 'tzQDgoseJVgV7BJOPSmvQcx2bB88MCFOCHVOvRT6028KvjUykaLXPQmjVFEAEf2T0dzTybkaeFqO5oo5nsIOg',
      JWT_EXPIRES_IN: '15m',
      REFRESH_TOKEN_EXPIRES_IN: '7d',
      FRONTEND_URL: 'http://bingo2026.work.gd',
      GOOGLE_CLIENT_ID: 'y869471917882-31anhrf0roojg8lffblvsm7g17f4f0ng.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: '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',
      GOOGLE_CALLBACK_URL: 'http://bingo2026.work.gd/api/auth/google/callback'
    }
  }]
};
EOFPM2

pm2 start ecosystem.config.js

echo "🌐 Setting up Nginx for frontend..."
sudo rm -rf /var/www/html/*
sudo cp -r bingo-frontend/dist/* /var/www/html/

echo "✅ Deployment complete!"
echo "Backend: http://localhost:8001/health"
echo "Frontend: http://bingo2026.work.gd"

pm2 list

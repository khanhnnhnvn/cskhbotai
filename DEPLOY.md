# Deployment Guide (Ubuntu 24.04 LTS)

This guide walks you through deploying the CSKH Bot AI (Next.js + MySQL) on a fresh Ubuntu 24.04 server.

## Prerequisites
- Server with Ubuntu 24.04.
- Root or sudo access.
- Domain name (optional, but recommended for Nginx).

## 1. Install Node.js & System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install tools
sudo apt install -y curl git unzip

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v
npm -v
```

## 2. Setup Database (MySQL)
If you already have a database server (e.g. `100.67.197.73`), ensure this machine can reach it.
Test connection:
```bash
ping 100.67.197.73
curl -v telnet://100.67.197.73:3306
```

If you need to install MySQL locally:
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
# Secure installation and create user/db as needed
```

## 3. Deployment

### A. Upload Code
Upload the project files to `/var/www/cskhbotai` (or clone via git).

### B. Configure Environment
Create `.env` file:
```bash
cp .env.example .env
nano .env
```
Fill in:
```ini
DATABASE_URL="mysql://nnkhanh:Bytesoft1204@100.67.197.73:3306/docusupport_db"
GEMINI_API_KEY="AIzaSy..."
```

### C. Install & Build
```bash
cd /var/www/cskhbotai
npm install

# Generate Prisma Client
npx prisma generate

# Sync Database (Create Tables)
npx prisma db push

# Build Next.js App
npm run build
```

### D. Run with PM2
Use PM2 to keep the app running in background.
```bash
sudo npm install -g pm2
pm2 start npm --name "cskhbot" -- start
pm2 save
pm2 startup
```

## 4. Configuring Nginx (Reverse Proxy)

Install Nginx:
```bash
sudo apt install -y nginx
```

Create config:
```bash
sudo nano /etc/nginx/sites-available/cskhbot
```

Content:
```nginx
server {
    listen 80;
    server_name your_domain.com; # Or IP address

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/cskhbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting
- **Database Connection Error**: Check Firewall on DB server (port 3306) and `.env` config.
- **502 Bad Gateway**: Check if PM2 app is running (`pm2 status`).
- **Build Fails**: Ensure `legacy_src` is excluded in `tsconfig.json` (already configured).

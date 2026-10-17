# Pani Safe — IBM LinuxONE Community Cloud Deployment Guide

**Target Environment:** IBM LinuxONE Community Cloud  
**Operating System:** Ubuntu 22.04 LTS / 24.04 LTS on IBM zSystems (s390x architecture)  
**Runtimes:** Node.js v20+ / v22+ / v24+, npm, Docker (optional containerized deployment)

---

## 1. Architectural Compatibility with s390x

IBM LinuxONE servers operate on the **s390x (Big-Endian 64-bit)** enterprise mainframe architecture. While standard JavaScript scripts execute platform-agnostically on V8, native C/C++ addons (gyp builds) often fail on s390x if architecture-specific binaries are absent.

Pani Safe was explicitly engineered for 100% native s390x compatibility:
- **Pure JavaScript dependencies:** `bcryptjs` replaces native `bcrypt`; standard Node.js native crypto is leveraged.
- **In-memory data indexing:** Zero dependency on native SQLite or binary driver compilations.
- **Pure JavaScript CSV engine:** High-throughput streaming and file I/O using native Node.js buffers.

---

## 2. LinuxONE Environment Verification

Log in to your LinuxONE Community Cloud virtual machine via SSH:

```bash
ssh linux1@<your-linuxone-instance-ip>
```

Verify the mainframe architecture:

```bash
uname -m
# Expected output: s390x
```

Verify Node.js and npm:

```bash
node -v
# Expected: v20.x, v22.x, or v24.x

npm -v
# Expected: 10.x or 11.x
```

If Node.js is not yet installed on your s390x instance:

```bash
sudo apt update
sudo apt install -y nodejs npm git
```

---

## 3. Cloning and Setting Up Pani Safe

```bash
# Clone the repository
git clone https://github.com/<your-username>/PaniSafe.git
cd PaniSafe

# Install backend dependencies
cd backend
npm install

# Verify or generate the CGWB Maharashtra historical dataset
npm run generate-data
# If you have exported files from JupyterLab, place them in:
# backend/data/pani_safe_results.csv
# backend/data/pani_safe_alerts.csv

# Install frontend dependencies and compile production bundle
cd ../frontend
npm install
npm run build
cd ..
```

---

## 4. Starting the Production Server on LinuxONE

The Express backend automatically serves the compiled React application from `frontend/dist`. A single unified process serves both the REST API and the frontend client!

```bash
# Option A: Start directly in foreground
cd backend
PORT=5000 NODE_ENV=production npm start

# Option B: Run in the background using PM2 or nohup
npm install -g pm2
pm2 start src/server.js --name "panisafe-linuxone"
pm2 save
```

Access the application in your browser:
```
http://<your-linuxone-ip>:5000/
```

Verify the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "system": {
    "platform": "linux",
    "architecture": "s390x",
    "nodeVersion": "v20.x.x"
  },
  "dataEngine": {
    "isLoaded": true,
    "totalRecordsLoaded": 18249,
    "stationsIndexed": 1804,
    "districtsCovered": 36
  }
}
```

---

## 5. Systemd Service Configuration (Production Auto-Start)

To ensure Pani Safe restarts automatically on LinuxONE reboot:

Create `/etc/systemd/system/panisafe.service`:

```ini
[Unit]
Description=Pani Safe Groundwater Platform (IBM Z Datathon 2026)
After=network.target

[Service]
Type=simple
User=linux1
WorkingDirectory=/home/linux1/PaniSafe/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable panisafe
sudo systemctl start panisafe
sudo systemctl status panisafe
```

---

## 6. Docker Deployment on LinuxONE (Optional)

If running within a Docker container on LinuxONE, use an official multi-arch Node image:

Create `Dockerfile` in root:

```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:22-slim
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "backend/src/server.js"]
```

Build and run on s390x:

```bash
docker build -t panisafe:s390x .
docker run -d -p 5000:5000 --name panisafe-app panisafe:s390x
```

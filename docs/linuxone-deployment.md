# Pani Safe — IBM LinuxONE Community Cloud Deployment Guide

**Event:** IBM Z Datathon 2026 (Event Code: **SSF2026**)  
**Target Environment:** IBM LinuxONE Community Cloud  
**Target VM Name:** `PaniSafe2026`  
**Operating System:** Ubuntu 22.04 LTS / 24.04 LTS on IBM zSystems (s390x architecture)  
**Runtimes:** Node.js v20+ / v22+ / v24+, npm  

---

## 1. Architectural Compatibility with s390x

IBM LinuxONE servers operate on the **s390x (Big-Endian 64-bit)** enterprise mainframe architecture. While standard JavaScript scripts execute platform-agnostically on V8, native C/C++ addons (gyp builds) often fail on s390x if architecture-specific binaries or cross-compilation toolchains are absent.

Pani Safe was explicitly engineered for 100% native s390x compatibility:
- **Pure JavaScript dependencies:** `bcryptjs` replaces native `bcrypt`; standard Node.js native crypto is leveraged.
- **In-memory data indexing:** Zero dependency on native SQLite or binary database driver compilations.
- **Pure JavaScript CSV engine:** High-throughput streaming and file I/O using native Node.js buffers.
- **No C/C++ addons:** Zero native addon dependencies across `backend/package.json`.

---

## 2. LinuxONE Environment Verification & SSH Tunneling

### Recommended Judging Connection (Secure Loopback Binding)
To evaluate the application securely without opening public firewall ports, establish an **SSH tunnel** forwarding port 5000:

```bash
# Connect using the LinuxONE VM username and IP:
ssh -L 5000:localhost:5000 -i <path-to-private-key> linux1@<LINUXONE_VM_IP>
```
*(If using the designated datathon identity file: `ssh -L 5000:localhost:5000 -i work/linuxone_ed25519 linux1@<LINUXONE_VM_IP>`)*

### Verify Architecture on VM
Once connected to the VM:

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

## 3. Cloning, Building & Running Pani Safe on LinuxONE

```bash
# 1. Clone the repository
git clone https://github.com/shreyansh-sinha-1509s/PaniSafe.git
cd PaniSafe

# 2. Install dependencies
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..

# 3. Compile production frontend bundle
npm run build

# 4. Execute automated integration tests
npm test
# Expected: 19 passed, 0 failed
```

---

## 4. Starting the Production Server on LinuxONE

The Express backend automatically serves the compiled React application from `frontend/dist`. A single unified process serves both the REST API and the frontend client:

```bash
# Start in background via PM2 or foreground:
cd backend
PORT=5000 NODE_ENV=production npm start
```

### Verify Telemetry on LinuxONE
In another terminal session on the VM (or via the SSH tunnel):
```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-17T18:50:00.000Z",
  "eventCode": "SSF2026",
  "system": {
    "platform": "linux",
    "architecture": "s390x",
    "nodeVersion": "v22.x.x",
    "uptimeSeconds": 42,
    "memoryUsageMB": {
      "rss": 82.5,
      "heapTotal": 45.2,
      "heapUsed": 38.1
    }
  },
  "dataEngine": {
    "isLoaded": true,
    "totalRecordsLoaded": 18249,
    "stationsIndexed": 1804,
    "districtsCovered": 36,
    "alertsCount": 2865,
    "isSyntheticData": true
  }
}
```

Now open **`http://localhost:5000`** in your local browser to interact with the full web UI over the secure SSH tunnel.

---

## 5. Systemd Service Configuration (Production Auto-Start)

To ensure Pani Safe restarts automatically on LinuxONE reboot:

Create `/etc/systemd/system/panisafe.service`:

```ini
[Unit]
Description=Pani Safe Groundwater Decision-Support Platform (IBM Z Datathon 2026 - SSF2026)
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

## 6. Security & Safe Evaluation Principles

- **No Public Port Exposure:** Keep the backend bound to `localhost:5000` and view via SSH port forwarding (`-L 5000:localhost:5000`).
- **Throwaway Demo Credentials:** Use `analyst.demo@panisafe.in` / `DemoAnalyst2026!`.
- **Private Key Hygiene:** Never copy private keys (`work/linuxone_ed25519`) into Git or print them to stdout.
- **Auditable State:** Feedback submissions are stored locally in `backend/data/feedback.json`.

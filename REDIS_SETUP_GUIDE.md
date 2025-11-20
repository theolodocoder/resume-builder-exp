# Redis Setup Guide for Resume Builder

Your resume parser uses **BullMQ** for job queue management, which requires **Redis** as a backend. Here's how to set up Redis on your system.

---

## Quick Start (Docker - Recommended)

### Prerequisites
- Docker installed on your machine
- Or Docker Desktop for Windows/Mac

### Setup Redis with Docker

```bash
# Start Redis in Docker
docker run -d -p 6379:6379 --name resume-builder-redis redis:latest

# Verify Redis is running
docker exec resume-builder-redis redis-cli ping
# Should respond: PONG

# Stop Redis when done
docker stop resume-builder-redis

# Start it again later
docker start resume-builder-redis
```

---

## Platform-Specific Setup

### Windows

#### Option 1: Docker (Easiest)
See "Quick Start" section above.

#### Option 2: Windows Subsystem for Linux (WSL)

```bash
# Install WSL2 if not already done
# Open PowerShell as Admin and run:
wsl --install

# In WSL terminal:
sudo apt update
sudo apt install redis-server

# Start Redis
redis-server

# Test in another WSL terminal
redis-cli ping  # Should respond: PONG
```

#### Option 3: Windows Native Build
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Download `Redis-x64-*.msi`
3. Run installer
4. Redis will start as a service
5. Test: `redis-cli ping`

---

### macOS

#### Option 1: Homebrew (Recommended)

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Redis
brew install redis

# Start Redis (foreground)
redis-server

# Or start as background service
brew services start redis

# Test in another terminal
redis-cli ping  # Should respond: PONG

# Stop Redis service
brew services stop redis
```

#### Option 2: Docker
See "Quick Start" section above.

---

### Linux

#### Ubuntu/Debian

```bash
# Update package lists
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Test
redis-cli ping  # Should respond: PONG

# Check status
sudo systemctl status redis-server
```

#### Red Hat/CentOS/Fedora

```bash
# Install Redis
sudo dnf install redis

# Start Redis service
sudo systemctl start redis

# Enable on boot
sudo systemctl enable redis

# Test
redis-cli ping  # Should respond: PONG
```

#### Arch Linux

```bash
# Install Redis
sudo pacman -S redis

# Start Redis
sudo systemctl start redis

# Enable on boot
sudo systemctl enable redis

# Test
redis-cli ping
```

---

## Verify Redis Installation

### Check if Redis is Running

```bash
# Test connection
redis-cli ping
# Should respond: PONG

# Get server info
redis-cli info server

# List all keys (should be empty on fresh install)
redis-cli keys '*'

# Test set/get
redis-cli set test "Hello"
redis-cli get test  # Should respond: "Hello"
redis-cli del test
```

### Common Redis CLI Commands

```bash
# Connect to Redis
redis-cli

# In redis-cli prompt:
PING                 # Test connection
INFO                 # Server info
DBSIZE              # Number of keys
FLUSHDB             # Clear current database (CAUTION!)
MONITOR             # Watch all commands in real-time
SHUTDOWN            # Stop Redis server
```

---

## Configuration for Resume Builder

### Default Configuration

By default, the application uses:
```
Redis Host: localhost
Redis Port: 6379
Redis Protocol: redis://localhost:6379
```

### Custom Configuration

Set environment variables to use different Redis instance:

```bash
# Linux/Mac
export REDIS_URL=redis://your-host:6379

# Windows (Command Prompt)
set REDIS_URL=redis://your-host:6379

# Windows (PowerShell)
$env:REDIS_URL="redis://your-host:6379"
```

Then start server:
```bash
npm start
```

### Example: Redis on Different Machine

```bash
# If Redis is on IP 192.168.1.100
export REDIS_URL=redis://192.168.1.100:6379
npm start
```

### Example: Redis with Password

```bash
# If Redis requires authentication
export REDIS_URL=redis://:password@localhost:6379
npm start
```

---

## Troubleshooting

### Redis Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
1. Check if Redis is running: `redis-cli ping`
2. If not running, start it with appropriate command for your platform
3. Verify port is 6379: `redis-cli --help | grep port`

### Port Already in Use

```
Error: Address already in use
```

**Solution:**
```bash
# Find what's using port 6379
lsof -i :6379  # On macOS/Linux
netstat -ano | findstr :6379  # On Windows

# Either:
# 1. Stop the other process
# 2. Or change port in redis.conf: port 6380
```

### Redis Config File Location

- **macOS**: `/usr/local/etc/redis.conf`
- **Linux**: `/etc/redis/redis.conf` or `/etc/redis/redis-server.conf`
- **Windows**: `C:\Program Files\Redis\redis.conf` (if installed)
- **Docker**: Not applicable (container-based)

### Memory Issues

Redis stores everything in memory. Monitor usage:

```bash
redis-cli info memory

# If running out of memory, configure max memory in redis.conf:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
```

---

## Docker-Specific Commands

### View Redis Logs

```bash
docker logs resume-builder-redis
```

### Access Redis CLI in Docker

```bash
docker exec -it resume-builder-redis redis-cli
```

### Stop and Remove Redis Container

```bash
docker stop resume-builder-redis
docker rm resume-builder-redis
```

### Use Docker Compose (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  redis:
    image: redis:latest
    container_name: resume-builder-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  app:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

volumes:
  redis-data:
```

Run with:
```bash
docker-compose up -d
docker-compose down  # Stop all
```

---

## Persistence (Optional)

### Enable AOF (Append-Only File)

Persistence in `redis.conf`:
```
appendonly yes
appendfsync everysec
```

This saves every command to disk, so data persists after restart.

### Enable RDB (Snapshots)

```
save 900 1      # Save after 900 sec if 1+ keys changed
save 300 10     # Save after 300 sec if 10+ keys changed
save 60 10000   # Save after 60 sec if 10000+ keys changed
```

---

## Next Steps

1. ✅ Install Redis using method for your platform
2. ✅ Verify with `redis-cli ping` → should respond `PONG`
3. ✅ Start the resume builder server: `npm start` (in server directory)
4. ✅ Test resume upload from client UI

---

## Verification Checklist

- [ ] Redis installed and running
- [ ] `redis-cli ping` responds with `PONG`
- [ ] Server shows "✓ Job queue initialized"
- [ ] Server shows "✓ Job worker started"
- [ ] Can upload resume file
- [ ] Job status endpoint returns 200 OK
- [ ] Resume parsing completes successfully

---

**Need Help?**

Check logs:
```bash
# Server logs (will show Redis connection status)
npm start

# Redis logs
redis-cli monitor  # Real-time command monitoring
```

Common issues are usually Redis not running. Make sure it's started before running `npm start`.

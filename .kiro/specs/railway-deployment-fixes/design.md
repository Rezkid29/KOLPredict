# Design Document: Railway Deployment Fixes

## Overview

This design addresses critical production deployment issues for Railway platform by fixing static asset serving, health check timing, database validation, WebSocket stability, UI component imports, browser automation initialization, and memory management. The solution ensures the application deploys successfully on Railway's free tier (512 MB memory limit) and handles all edge cases that cause 502 errors and deployment failures.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Edge Proxy                        │
│  - Routes traffic to application port                        │
│  - Performs health checks on /healthz                        │
│  - Returns 502 if connection fails                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Express HTTP Server (0.0.0.0:PORT)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Immediate Health Check (before migrations)          │   │
│  │  GET /healthz → 200 OK (always)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Static Asset Serving                                │   │
│  │  - Production: serve from dist/public                │   │
│  │  - Development: Vite dev server                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes (with validation)                        │   │
│  │  - Forum voting (validate vote_type)                 │   │
│  │  - Bet placement (validate numeric overflow)         │   │
│  │  - WebSocket server (error handling)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          Background Services (deferred startup)              │
│  - Puppeteer/Playwright (lazy initialization)               │
│  - Market resolver (after server ready)                     │
│  - Metrics updater (after server ready)                     │
│  - Deposit monitor (after server ready)                     │
└─────────────────────────────────────────────────────────────┘
```

### Startup Sequence (Critical for Railway)

```
1. Load environment variables
   ├─ Validate DATABASE_URL exists
   └─ Set PORT from environment (default 5000)

2. Create Express app
   ├─ Configure middleware
   ├─ Set trust proxy = 1
   └─ Add immediate /healthz endpoint (200 OK)

3. Start HTTP server FIRST
   ├─ Listen on 0.0.0.0:PORT
   ├─ Set keepAliveTimeout = 65000ms
   ├─ Set headersTimeout = 66000ms
   └─ Log "Server started successfully"

4. Run database migrations (async, non-blocking)
   ├─ Connect to Neon database
   ├─ Run pending migrations
   └─ Log migration status

5. Initialize background services (deferred 1 second)
   ├─ Defer Puppeteer initialization
   ├─ Start market resolver
   ├─ Start metrics updater
   └─ Start deposit monitor
```

## Components and Interfaces

### 1. Health Check Endpoint (server/index.ts)

**Purpose:** Respond immediately to Railway health checks without waiting for migrations.

**Current Issue:** Health check waits for migrations, causing Railway to timeout.

**Solution:**
```typescript
// Add BEFORE any async initialization
app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// Then start server immediately
const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
  console.log("✅ Server started successfully");
  
  // Set Railway-compatible timeouts
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  
  // Defer heavy initialization
  setTimeout(() => {
    startBackgroundServices();
  }, 1000);
});
```

### 2. Static Asset Serving (server/vite.ts)

**Purpose:** Serve built frontend files from correct directory.

**Current Issue:** `serveStatic` points to `dist` but Vite builds to `dist/public`.

**Solution:**
```typescript
export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    console.error(`❌ Static files not found at ${distPath}`);
    console.error("Run 'npm run build' to generate static files");
    throw new Error("Static files missing");
  }
  
  console.log(`✅ Serving static files from ${distPath}`);
  
  app.use(express.static(distPath));
  
  // Fallback to index.html for SPA routing
  app.use("*", (_req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });
}
```

**Vite Configuration Update (vite.config.ts):**
```typescript
export default defineConfig({
  build: {
    outDir: "dist/public", // Match Express serving path
    emptyOutDir: true,
  },
});
```

### 3. Database Validation Layer (server/validation.ts)

**Purpose:** Validate all inputs before database operations to prevent constraint violations.

**Current Issues:**
- Forum votes insert null vote_type
- Numeric overflow on bet amounts

**Solution - Forum Vote Validation:**
```typescript
export function validateVote(voteType: any): { valid: boolean; error?: string; value?: 'up' | 'down' } {
  if (!voteType) {
    return { valid: false, error: "vote_type is required" };
  }
  
  const normalized = String(voteType).toLowerCase().trim();
  
  if (normalized !== 'up' && normalized !== 'down') {
    return { valid: false, error: "vote_type must be 'up' or 'down'" };
  }
  
  return { valid: true, value: normalized as 'up' | 'down' };
}
```

**Solution - Numeric Overflow Validation:**
```typescript
export function validateNumericField(
  value: any,
  fieldName: string,
  maxPrecision: number = 20,
  maxScale: number = 9
): { valid: boolean; error?: string; value?: string } {
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  
  // Check if number fits in decimal(20,9)
  const strValue = num.toFixed(maxScale);
  const [intPart, decPart] = strValue.split('.');
  
  if (intPart.replace('-', '').length > (maxPrecision - maxScale)) {
    return { 
      valid: false, 
      error: `${fieldName} exceeds maximum precision (${maxPrecision},${maxScale})` 
    };
  }
  
  return { valid: true, value: strValue };
}
```

### 4. Forum Voting Endpoints (server/routes.ts)

**Current Issue:** Null vote_type causes constraint violation.

**Solution:**
```typescript
app.post("/api/forum/threads/:threadId/vote", voteRateLimiter, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { voteType } = req.body;
    const userId = getUserIdFromSession(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // VALIDATE BEFORE DATABASE OPERATION
    const validation = validateVote(voteType);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }
    
    // Use validated value
    await storage.voteOnThread(userId, threadId, validation.value!);
    
    res.json({ message: "Vote recorded" });
  } catch (error) {
    console.error("Error voting on forum thread:", error);
    res.status(500).json({ message: "Failed to vote" });
  }
});
```

### 5. WebSocket Error Handling (server/routes.ts)

**Current Issue:** WebSocket errors crash the server.

**Solution:**
```typescript
const broadcast = (data: any) => {
  try {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      } catch (clientError) {
        console.error("Error sending to WebSocket client:", clientError);
        // Don't throw - continue to other clients
      }
    });
  } catch (error) {
    console.error("Error broadcasting WebSocket message:", error);
    // Don't throw - log and continue
  }
};

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('error', (error) => {
    console.error('WebSocket client error:', error);
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});
```

### 6. Browser Automation Initialization (server/routes.ts)

**Current Issue:** Puppeteer initialization blocks server startup and exceeds memory limit.

**Solution:**
```typescript
export async function registerRoutes(app: Express): Promise<{ 
  httpServer: Server; 
  startBackgroundServices: () => void 
}> {
  const httpServer = createServer(app);
  
  // ... setup routes ...
  
  // Return function to start background services AFTER server is listening
  const startBackgroundServices = () => {
    console.log("🚀 Starting background services...");
    
    // Defer Puppeteer initialization
    setTimeout(async () => {
      try {
        await socialMediaClient.initialize();
        console.log("✅ Browser automation initialized");
      } catch (error) {
        console.error("⚠️  Browser automation failed to initialize:", error);
        console.log("📊 Continuing without scraping capabilities");
      }
    }, 2000);
    
    // Start other services
    metricsUpdater.start();
    marketResolver.start();
    depositMonitor.start();
    withdrawalProcessor.start();
  };
  
  return { httpServer, startBackgroundServices };
}
```

### 7. UI Component Imports (client/src/pages/messages.tsx)

**Current Issue:** AlertDialogTrigger and other components not imported.

**Solution:**
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
```

### 8. Database Migration Safety (server/migrate.ts)

**Current Issue:** Migrations fail silently or block startup.

**Solution:**
```typescript
export async function runMigrations() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    console.log("🔄 Running database migrations...");
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Run migrations with timeout
    const migrationPromise = migrate(db, { migrationsFolder: "./migrations" });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Migration timeout")), 30000)
    );
    
    await Promise.race([migrationPromise, timeoutPromise]);
    
    await pool.end();
    console.log("✅ Database migrations completed");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    throw error; // Let server handle the error
  }
}
```

## Data Models

### Forum Vote Validation

```typescript
interface VoteValidation {
  valid: boolean;
  error?: string;
  value?: 'up' | 'down';
}
```

### Numeric Field Validation

```typescript
interface NumericValidation {
  valid: boolean;
  error?: string;
  value?: string; // Validated string representation
}
```

### Health Check Response

```typescript
interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: number;
  services?: {
    database: 'connected' | 'disconnected';
    websocket: 'active' | 'inactive';
    browser: 'initialized' | 'unavailable';
  };
}
```

## Error Handling

### Error Response Format

All API errors return consistent structure:

```typescript
interface ErrorResponse {
  message: string;
  errorCode?: string;
  details?: any;
  timestamp: number;
}
```

### Database Constraint Violations

```typescript
try {
  await storage.voteOnThread(userId, threadId, voteType);
} catch (error) {
  if (error.code === '23502') { // NOT NULL violation
    return res.status(400).json({
      message: "Invalid vote data",
      errorCode: "VALIDATION_ERROR",
      details: error.message
    });
  }
  if (error.code === '22003') { // Numeric overflow
    return res.status(400).json({
      message: "Numeric value out of range",
      errorCode: "NUMERIC_OVERFLOW",
      details: error.message
    });
  }
  throw error; // Re-throw unexpected errors
}
```

### WebSocket Error Recovery

```typescript
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
  // Don't crash - WebSocket server continues
});

ws.on('error', (error) => {
  console.error('WebSocket client error:', error);
  // Client will reconnect automatically
});
```

## Testing Strategy

### 1. Railway Deployment Testing

**Test Health Check Timing:**
```bash
# Start server and immediately check health
curl http://localhost:5000/healthz
# Should return 200 OK within 100ms
```

**Test Static Asset Serving:**
```bash
# Build and verify output location
npm run build
ls -la dist/public/index.html
# Should exist

# Start production server
NODE_ENV=production npm start
curl http://localhost:5000/
# Should return index.html
```

**Test Memory Usage:**
```bash
# Monitor memory during startup
node --max-old-space-size=512 dist/index.js
# Should stay under 512 MB
```

### 2. Database Validation Testing

**Test Forum Vote Validation:**
```typescript
describe('Forum Vote Validation', () => {
  it('should reject null vote_type', async () => {
    const response = await request(app)
      .post('/api/forum/threads/123/vote')
      .send({ voteType: null });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('vote_type is required');
  });
  
  it('should accept valid vote_type', async () => {
    const response = await request(app)
      .post('/api/forum/threads/123/vote')
      .send({ voteType: 'up' });
    
    expect(response.status).toBe(200);
  });
});
```

**Test Numeric Overflow Prevention:**
```typescript
describe('Numeric Overflow Prevention', () => {
  it('should reject bet amounts exceeding decimal(20,9)', async () => {
    const response = await request(app)
      .post('/api/bets')
      .send({ 
        marketId: '123',
        amount: 99999999999.999999999, // Exceeds precision
        position: 'YES'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('exceeds maximum precision');
  });
});
```

### 3. WebSocket Stability Testing

**Test Connection Error Handling:**
```typescript
describe('WebSocket Error Handling', () => {
  it('should not crash server when client disconnects abruptly', async () => {
    const ws = new WebSocket('ws://localhost:5000/ws');
    await new Promise(resolve => ws.on('open', resolve));
    
    // Simulate abrupt disconnect
    ws.terminate();
    
    // Server should still respond
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
  });
});
```

### 4. Browser Automation Testing

**Test Lazy Initialization:**
```typescript
describe('Browser Automation Initialization', () => {
  it('should start server before initializing Puppeteer', async () => {
    const startTime = Date.now();
    
    // Server should start quickly
    await waitForServer('http://localhost:5000/healthz');
    const serverStartTime = Date.now() - startTime;
    
    expect(serverStartTime).toBeLessThan(2000); // Under 2 seconds
    
    // Puppeteer initializes later
    await new Promise(resolve => setTimeout(resolve, 3000));
  });
  
  it('should continue serving API if Puppeteer fails', async () => {
    // Simulate Puppeteer failure
    process.env.CHROMIUM_EXECUTABLE_PATH = '/invalid/path';
    
    // Server should still work
    const response = await request(app).get('/api/markets');
    expect(response.status).toBe(200);
  });
});
```

## Performance Considerations

### Memory Optimization for Railway Free Tier

**Current Memory Usage:**
- Express + middleware: ~50 MB
- Neon database driver: ~30 MB
- Puppeteer (with Chromium): ~200-300 MB
- Background services: ~50 MB
- **Total: ~400 MB** (within 512 MB limit)

**Optimization Strategy:**
1. Defer Puppeteer initialization until after server starts
2. Use Playwright's bundled browser (smaller footprint)
3. Limit concurrent scraping operations
4. Close browser instances when not in use
5. Use connection pooling for database

**Implementation:**
```typescript
// Lazy browser initialization
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browserInstance;
}

// Close browser when idle
let browserIdleTimeout: NodeJS.Timeout;

function scheduleBrowserClose() {
  clearTimeout(browserIdleTimeout);
  browserIdleTimeout = setTimeout(async () => {
    if (browserInstance) {
      await browserInstance.close();
      browserInstance = null;
      console.log("🔒 Browser closed due to inactivity");
    }
  }, 5 * 60 * 1000); // 5 minutes idle
}
```

### Database Connection Pooling

```typescript
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum 10 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Deployment Checklist

### Pre-Deployment

- [ ] Verify DATABASE_URL is set in Railway environment
- [ ] Verify SESSION_SECRET is set
- [ ] Verify PORT is set (or defaults to 5000)
- [ ] Run `npm run build` locally to verify static assets build to dist/public
- [ ] Test health check endpoint returns 200 immediately
- [ ] Verify Vite config outputs to dist/public

### Post-Deployment

- [ ] Check Railway logs for "Server started successfully"
- [ ] Verify health check passes: `curl https://your-app.railway.app/healthz`
- [ ] Verify static assets load: `curl https://your-app.railway.app/`
- [ ] Check memory usage stays under 512 MB
- [ ] Verify WebSocket connections work
- [ ] Test API endpoints respond correctly
- [ ] If 502 errors persist, detach and reattach domain in Railway dashboard

### Troubleshooting Commands

```bash
# Check if server is listening
railway run curl http://localhost:5000/healthz

# Check memory usage
railway run ps aux

# Check port binding
railway run netstat -tulpn | grep 5000

# View recent logs
railway logs --tail 100

# Shell into container
railway shell
```

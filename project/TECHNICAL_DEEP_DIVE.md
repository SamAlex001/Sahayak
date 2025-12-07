# SAHAYATA 2.0 - TECHNICAL DEEP DIVE

## Detailed Implementation Analysis

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Implementation Details

**Token Generation:**

```typescript
// server/routes/auth.ts
const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
  expiresIn: "7d",
});
```

**Token Structure:**

```json
{
  "sub": "user_id_here",
  "email": "user@example.com",
  "iat": 1699564800,
  "exp": 1700169600
}
```

**Authentication Middleware:**

```typescript
// server/middleware/auth.ts
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: "missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
};
```

**Frontend Auth Context:**

```typescript
// src/contexts/AuthContext.tsx
- Stores user state globally
- Automatically refreshes on mount
- Persists token in localStorage
- Provides refresh() method for manual updates
```

**Security Features:**

1. Token stored in localStorage (accessible only to same-origin scripts)
2. Tokens expire after 7 days
3. Password never sent to client
4. Bcrypt with 10 salt rounds
5. Email normalization prevents duplicate accounts

---

## 📡 REAL-TIME NOTIFICATION SYSTEM

### Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Cron Job  │────>│   Database   │────>│   Socket.IO │
│  (5 min)    │     │  (MongoDB)   │     │   Server    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  External    │     │  Connected  │
                    │  Services    │     │   Clients   │
                    │ (SMS/Email)  │     │  (Browser)  │
                    └──────────────┘     └─────────────┘
```

### Cron Job Implementation

**Schedule:** Every 5 minutes (`*/5 * * * *`)

**Process Flow:**

1. Get current time + 60 minutes window
2. Query appointments/routines in date range
3. Filter items where time difference is 0-60 minutes
4. Create in-app notifications (MongoDB)
5. Send external notifications (Email/SMS)
6. Mark as `reminderSent: true`

**Query Logic:**

```typescript
const now = new Date();
const inOneHour = new Date(now.getTime() + 60 * 60000);
const today = now.toISOString().slice(0, 10);
const soon = inOneHour.toISOString().slice(0, 10);

const candidates = await AppointmentModel.find({
  date: { $in: [today, soon] },
  reminderSent: false,
});

// Filter: Only notify if within 0-60 minutes
const toNotify = candidates.filter((appt) => {
  const when = new Date(`${appt.date}T${appt.time}:00`);
  const diffMin = (when.getTime() - now.getTime()) / 60000;
  return diffMin >= 0 && diffMin <= 60;
});
```

### Multi-Channel Delivery

**1. In-App Notifications:**

```typescript
await NotificationModel.insertMany(
  toNotify.map((a) => ({
    userId: a.userId,
    type: "appointment",
    title: "Upcoming appointment",
    message: `${a.title} at ${a.time}`,
    data: { appointmentId: a._id },
    read: false,
  }))
);
```

**2. Email Notifications:**

```typescript
// Using Nodemailer
const sendEmail = async (to: string, subject: string, text: string) => {
  if (!mailTransport) return;
  await mailTransport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });
};
```

**3. SMS Notifications:**

```typescript
// Using Twilio
const sendSms = async (to: string, body: string) => {
  if (!smsClient) return;
  const formattedPhone = formatPhoneNumber(to); // E.164 format
  await smsClient.messages.create({
    from: process.env.TWILIO_FROM,
    to: formattedPhone,
    body,
  });
};
```

### Phone Number Formatting (E.164)

**Problem:** Indian phone numbers come in various formats:

- `9876543210` (10 digits)
- `+91 9876543210`
- `91 9876543210`
- `+919876543210`

**Solution:**

```typescript
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, ""); // Remove non-digits

  if (!phone.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned; // Add India code
    }
  }

  return "+" + cleaned; // E.164 format
};
```

**Result:** `+919876543210`

---

## 🗄️ DATABASE DESIGN PATTERNS

### User-Centric Design

**All collections reference userId:**

```typescript
// Enables efficient user-specific queries
{ userId: { type: String, required: true, index: true } }
```

**Benefits:**

- Fast lookups: O(log n) with index
- Easy data isolation
- Simple authorization checks

### Reminder State Management

**Problem:** Prevent duplicate reminders

**Solution:** Boolean flags

```typescript
{
  reminderSent: boolean,           // In-app notification sent
  externalReminderSent: boolean    // Email/SMS sent
}
```

**Update Strategy:**

```typescript
// After creating notifications
await AppointmentModel.updateMany(
  { _id: { $in: toNotify.map((a) => a._id) } },
  { $set: { reminderSent: true } }
);

// After sending email/SMS
await AppointmentModel.updateMany(
  { _id: { $in: toNotify.map((a) => a._id) } },
  { $set: { externalReminderSent: true } }
);
```

### Profile Completeness Tracking

**Purpose:** Enforce profile requirements for features

**Implementation:**

```typescript
interface Profile {
  // Required fields
  full_name: string;
  phone: string;
  address: string;
  emergency_contact: string;

  // Calculated field
  is_profile_complete: boolean;
}

// Auto-calculate on update
const requiredFilled =
  !!profile.full_name &&
  !!profile.phone &&
  !!profile.address &&
  !!profile.emergency_contact;

await updateProfile({
  ...data,
  is_profile_complete: requiredFilled,
});
```

**Usage:**

- Block support group joining
- Enable notification features
- UI feedback

---

## 📤 FILE UPLOAD SYSTEM

### Multer Configuration

```typescript
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
```

### Secure File Access

**Problem:** Direct file URLs expose all files

**Solution:** Authentication-required endpoint

```typescript
router.get("/file/:filename", requireAuth, async (req, res) => {
  const { filename } = req.params;
  const userId = req.userId;

  // Verify file belongs to user
  const record = await MedicalRecordModel.findOne({
    userId,
    attachmentUrl: `/api/medical-records/file/${filename}`,
  });

  if (!record) {
    return res.status(404).json({ error: "File not found" });
  }

  // Send file
  const filepath = path.join(__dirname, "../uploads", filename);
  res.sendFile(filepath);
});
```

**Security Features:**

1. JWT authentication required
2. User ownership verification
3. No directory traversal (path validation)
4. File type restrictions
5. Size limits

### Frontend File Upload

**Using FormData (not JSON):**

```typescript
const formData = new FormData();
formData.append("date", newRecord.date);
formData.append("type", newRecord.type);
formData.append("description", newRecord.description);
if (selectedFile) {
  formData.append("attachment", selectedFile);
}

// Don't use apiFetch (sets Content-Type to JSON)
const token = localStorage.getItem("token");
const response = await fetch("/api/medical-records", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData, // Browser sets correct Content-Type
});
```

---

## 🔌 SOCKET.IO ARCHITECTURE

### Server Setup

```typescript
import { Server as SocketIOServer } from "socket.io";
import http from "http";

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// Make available to other modules
setIo(io);

// Event handlers
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-group", (groupId: string) => {
    socket.join(`group:${groupId}`);
  });

  socket.on("join-notifications", (userId: string) => {
    socket.join(`notifications:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
```

### Room Pattern

**Concept:** Rooms for targeted broadcasting

**Groups:**

```typescript
// User joins room when opening group chat
socket.join(`group:${groupId}`);

// Broadcast to all members
io.to(`group:${groupId}`).emit("message", {
  userId,
  message,
  timestamp: new Date(),
});
```

**Notifications:**

```typescript
// User joins personal notification room
socket.join(`notifications:${userId}`);

// Send notification to specific user
io.to(`notifications:${userId}`).emit("notification", {
  type: "appointment",
  title: "Reminder",
  message: "Appointment in 1 hour",
});
```

### Client Integration

```typescript
import io from "socket.io-client";

const socket = io("http://localhost:4000");

// Join rooms
socket.emit("join-notifications", userId);
socket.emit("join-group", groupId);

// Listen for events
socket.on("notification", (data) => {
  console.log("New notification:", data);
  // Update UI
});

socket.on("message", (data) => {
  console.log("New message:", data);
  // Update chat
});
```

### Vite Proxy for WebSocket

```typescript
// vite.config.ts
server: {
  proxy: {
    '/socket.io': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      ws: true  // Enable WebSocket proxying
    }
  }
}
```

---

## 🎨 FRONTEND ARCHITECTURE

### Component Hierarchy

```
App.tsx
├── AuthProvider (Context)
│   └── Router
│       ├── Navbar
│       ├── Routes
│       │   ├── Home
│       │   ├── Dashboard
│       │   │   ├── UpcomingReminders
│       │   │   ├── AppointmentList
│       │   │   ├── MedicationList
│       │   │   ├── EmergencyContacts
│       │   │   ├── DailyRoutineBuilder
│       │   │   └── SymptomTracker
│       │   ├── SupportGroups
│       │   │   ├── GroupCard[]
│       │   │   └── ChatBot (Modal)
│       │   ├── CommunityForum
│       │   │   └── ForumPost[]
│       │   │       └── ForumReply[]
│       │   ├── Training
│       │   │   └── VideoCard[]
│       │   ├── MedicalRecords
│       │   ├── SelfCare
│       │   │   ├── MoodTracker
│       │   │   └── ActivityCard[]
│       │   └── Profile
│       └── Footer
```

### State Management Strategy

**1. Global State (Context API):**

```typescript
// AuthContext - User authentication state
{
  user: { id, email, fullName, role } | null,
  loading: boolean,
  refresh: () => Promise<void>
}
```

**2. Local Component State:**

```typescript
// Most features use local useState
const [appointments, setAppointments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**3. LocalStorage State:**

```typescript
// Community Forum
localStorage.setItem("forumPosts", JSON.stringify(posts));
localStorage.setItem("forumLikes", JSON.stringify(likedPosts));

// Training
localStorage.setItem("completedTrainingVideos", JSON.stringify(completed));
```

**Why LocalStorage?**

- Instant load times
- Reduce server load
- Offline-first approach
- Simple implementation

**Trade-offs:**

- Not synced across devices
- Manual sync required
- Storage limits (5-10MB)

### API Integration Pattern

**Centralized API Helper:**

```typescript
// src/lib/api.ts
export const apiFetch = async (path: string, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }

  return res.json();
};
```

**Usage Pattern:**

```typescript
// In components
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/endpoint");
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

### Protected Route Pattern

```typescript
// src/components/auth/ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Usage in App.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

---

## 🎯 PERFORMANCE OPTIMIZATIONS

### 1. **MongoDB Indexes**

```typescript
{ userId: { type: String, index: true } }  // Fast user queries
{ email: { type: String, unique: true, index: true } }  // Fast login
```

### 2. **Cron Job Efficiency**

- Runs every 5 minutes (not every minute)
- Only queries near-future dates
- Batch updates with updateMany
- Early return if no candidates

### 3. **Frontend Optimizations**

- Lazy loading with React Router
- LocalStorage for frequent data
- Debounced search inputs
- Optimistic UI updates

### 4. **File Serving**

- Static file serving via Express
- Client-side caching
- Conditional file downloads

### 5. **Vite Build Optimizations**

```typescript
optimizeDeps: {
  exclude: ["lucide-react"]; // Don't pre-bundle large icon library
}
```

---

## 🔍 ERROR HANDLING PATTERNS

### Backend Error Pattern

```typescript
// Consistent structure
try {
  // Operation
  const result = await doSomething();
  return res.json({ success: true, data: result });
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("Operation failed:", message);
  return res.status(500).json({ error: message });
}
```

### Frontend Error Pattern

```typescript
// Component state
const [error, setError] = useState<string | null>(null);

// Try-catch with user feedback
try {
  setError(null);
  await apiFetch("/api/endpoint");
  setSuccess(true);
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed");
  console.error("Error:", err);
}

// Display
{
  error && (
    <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <p className="text-red-700">{error}</p>
    </div>
  );
}
```

### API Error Responses

**Standard Format:**

```json
{
  "error": "Descriptive error message",
  "details": "Optional additional context"
}
```

**HTTP Status Codes:**

- 200: Success
- 201: Created
- 204: No content (delete success)
- 400: Bad request (validation)
- 401: Unauthorized (auth)
- 404: Not found
- 409: Conflict (duplicate)
- 500: Server error

---

## 🧪 TESTING STRATEGY

### Manual Testing Endpoints

**1. Health Check:**

```bash
GET http://localhost:4000/health
# Response: { "ok": true }
```

**2. Test SMS:**

```bash
POST http://localhost:4000/api/test-sms
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "message": "Test message"
}
```

**3. Trigger Reminder Check:**

```bash
POST http://localhost:4000/api/trigger-appointment-check
Authorization: Bearer <token>

# Returns: candidates, toNotify count, appointment details
```

**4. Test User Notification:**

```bash
POST http://localhost:4000/api/notifications/test
Authorization: Bearer <token>

# Sends email + SMS to current user's profile
```

### Testing Checklist

**Authentication:**

- [ ] Sign up with new email
- [ ] Sign up with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong credentials
- [ ] Access protected route without token
- [ ] Token expiry handling

**Notifications:**

- [ ] Create appointment for 30 minutes from now
- [ ] Wait for cron job (max 5 minutes)
- [ ] Verify in-app notification appears
- [ ] Check email received
- [ ] Check SMS received
- [ ] Verify reminderSent flag updated

**File Upload:**

- [ ] Upload PDF file
- [ ] Upload image file
- [ ] Upload file > 10MB (should fail)
- [ ] Upload invalid type (should fail)
- [ ] View uploaded file
- [ ] Download file
- [ ] Delete file

**Real-time:**

- [ ] Join support group
- [ ] Open group chat
- [ ] Send message from one user
- [ ] Verify message appears for other users
- [ ] Test with multiple browser tabs

---

## 🏗️ SCALABILITY ROADMAP

### Phase 1: Current (Single Server)

```
[Client] ←→ [Vite Dev/Nginx] ←→ [Express + Socket.IO] ←→ [MongoDB]
                                         ↓
                                [Twilio, Nodemailer]
```

### Phase 2: Service Separation

```
[Client] ←→ [API Gateway]
              ├─→ [Auth Service]
              ├─→ [Notification Service] ←→ [Redis Queue]
              ├─→ [File Service] ←→ [S3]
              ├─→ [Chat Service] ←→ [Socket.IO Cluster]
              └─→ [MongoDB Replica Set]
```

### Phase 3: Microservices

```
[Load Balancer]
    ↓
[API Gateway] ←→ [Service Mesh]
    ↓
[Services]:
  - User Service
  - Appointment Service
  - Notification Service
  - File Service
  - Chat Service
  - Analytics Service
    ↓
[Data Layer]:
  - MongoDB Sharded
  - Redis Cache
  - S3 Storage
  - ElasticSearch (logs)
```

### Database Scaling

**Current:**

- Single MongoDB instance
- All collections in one database

**Future:**

- **Read Replicas:** Distribute read load
- **Sharding:** Partition by userId
- **Caching:** Redis for frequent queries
- **Search:** ElasticSearch for forum/resources

**Example Shard Key:**

```javascript
sh.shardCollection("sahayata.appointments", { userId: 1 });
```

### Notification Scaling

**Current:** Synchronous processing in cron job

**Future:**

```
[Cron Job] → [Redis Queue] → [Worker Pool]
                                  ↓
                          [External Services]
```

**Benefits:**

- Async processing
- Retry logic
- Rate limiting
- Load distribution

### File Storage Migration

**Current:** Local filesystem (`/uploads`)

**Migration Path:**

```javascript
// 1. Upload to S3
const s3Url = await uploadToS3(file);

// 2. Save URL in database
await MedicalRecordModel.create({
  attachmentUrl: s3Url,
  attachmentName: file.originalname,
});

// 3. Serve from S3
res.redirect(s3Url);
```

**Benefits:**

- Unlimited storage
- CDN integration
- Automatic backups
- Multi-region replication

---

## 🔐 SECURITY ENHANCEMENTS

### Current Security

✅ Password hashing (bcrypt)
✅ JWT authentication
✅ Protected API endpoints
✅ File type validation
✅ User-specific data access

### Additional Recommendations

**1. Rate Limiting:**

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});

app.use("/api/", limiter);
```

**2. Input Validation:**

```typescript
import { body, validationResult } from "express-validator";

router.post(
  "/appointments",
  requireAuth,
  body("title").notEmpty().trim().escape(),
  body("date").isISO8601(),
  body("time").matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process...
  }
);
```

**3. CSRF Protection:**

```typescript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

**4. Helmet (Security Headers):**

```typescript
import helmet from "helmet";

app.use(helmet());
```

**5. File Upload Security:**

```typescript
// Scan files for malware
import clamd from "clamdjs";

const scanner = clamd.createScanner(3310, "localhost");
const result = await scanner.scanBuffer(fileBuffer);
if (!result.isOk) {
  throw new Error("Infected file detected");
}
```

**6. Secrets Management:**

```typescript
// Use environment variables
// Never commit .env to git
// Use services like AWS Secrets Manager, Vault

// .gitignore
.env
.env.local
```

**7. SQL Injection Prevention:**

```typescript
// Using Mongoose (already safe)
// Parameterized queries prevent injection

// BAD (if using raw queries):
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// GOOD:
UserModel.findOne({ email }); // Mongoose handles escaping
```

---

## 📊 MONITORING & LOGGING

### Current Logging

**Morgan (HTTP):**

```typescript
app.use(morgan("dev"));
// GET /api/appointments 200 15.234 ms
```

**Console Logs:**

```typescript
console.log("📅 Found 3 appointments");
console.log("✅ SMS sent successfully");
console.error("❌ SMS failed:", error);
```

### Production Logging Recommendations

**1. Structured Logging (Winston):**

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

logger.info("User logged in", { userId, email, timestamp: new Date() });
logger.error("Failed to send SMS", { error, phoneNumber });
```

**2. Application Monitoring (New Relic/DataDog):**

```typescript
// Track performance metrics
// API response times
// Error rates
// Database query performance
// Memory usage
// CPU usage
```

**3. Error Tracking (Sentry):**

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: process.env.SENTRY_DSN });

try {
  // Operation
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

**4. Health Checks:**

```typescript
app.get("/health", async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: "checking...",
    services: {
      email: !!mailTransport,
      sms: !!smsClient,
      socketio: !!io,
    },
  };

  try {
    await mongoose.connection.db.admin().ping();
    health.database = "connected";
  } catch {
    health.database = "disconnected";
  }

  const status = health.database === "connected" ? 200 : 503;
  res.status(status).json(health);
});
```

---

## 🚀 DEPLOYMENT GUIDE

### Environment Setup

**Production Environment Variables:**

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sahayata
JWT_SECRET=<strong-random-secret-32+ chars>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<app-specific-password>
SMTP_FROM=noreply@sahayata.app
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_FROM=+1234567890
```

### Build Process

**Frontend:**

```bash
npm run build
# Creates dist/ folder with optimized assets
```

**Backend:**

```bash
tsc -p tsconfig.json
# Compiles TypeScript to JavaScript
```

### Docker Deployment

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 4000

# Start server
CMD ["node", "server/index.js"]
```

**docker-compose.yml:**

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/sahayata
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### Cloud Deployment Options

**1. Heroku:**

```bash
heroku create sahayata-app
heroku addons:create mongolab
git push heroku main
```

**2. AWS (EC2 + RDS):**

- EC2 instance for Node.js
- MongoDB Atlas or DocumentDB
- S3 for file storage
- CloudFront for CDN
- Route53 for DNS
- ALB for load balancing

**3. Vercel + MongoDB Atlas:**

- Vercel for frontend (Vite)
- Vercel serverless functions OR separate backend deployment
- MongoDB Atlas for database

**4. DigitalOcean:**

- Droplet for app server
- Managed MongoDB
- Spaces for file storage
- Load Balancer

---

## 📈 ANALYTICS IMPLEMENTATION

### Event Tracking

**Track User Actions:**

```typescript
// Add analytics service
import analytics from "./lib/analytics";

// Track page views
useEffect(() => {
  analytics.trackPageView(window.location.pathname);
}, [location]);

// Track feature usage
const handleJoinGroup = async (groupId) => {
  await apiFetch(`/api/groups/${groupId}/toggle`, { method: "POST" });
  analytics.trackEvent("support_group_joined", { groupId });
};
```

**Metrics to Track:**

- Daily/Monthly active users
- Feature usage (which pages visited most)
- Support group participation
- Training video completion rates
- Appointment creation frequency
- Medical record uploads
- Forum post engagement

### Implementation with Google Analytics

```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    gtag: any;
  }
}

export const analytics = {
  trackPageView: (path: string) => {
    window.gtag?.("config", "GA_MEASUREMENT_ID", {
      page_path: path,
    });
  },

  trackEvent: (action: string, params?: object) => {
    window.gtag?.("event", action, params);
  },
};
```

---

## 🎓 BEST PRACTICES DEMONSTRATED

### 1. **Separation of Concerns**

- Routes handle HTTP
- Models handle data
- Middleware handles auth
- Services handle business logic

### 2. **DRY (Don't Repeat Yourself)**

- Centralized API fetch helper
- Reusable auth middleware
- Component composition

### 3. **Error Handling**

- Try-catch throughout
- User-friendly messages
- Logging for debugging

### 4. **Type Safety**

- TypeScript interfaces
- Strong typing
- Compile-time checks

### 5. **Security First**

- Authentication required
- Input validation
- Secure file access

### 6. **User Experience**

- Loading states
- Error feedback
- Success confirmation
- Responsive design

### 7. **Code Organization**

- Logical folder structure
- Named exports
- Clear file names

### 8. **Documentation**

- Code comments where needed
- README for setup
- API documentation

---

**End of Technical Deep Dive**

This document provides implementation-level details for technical discussions during your interview. Focus on explaining the "why" behind decisions, not just the "what."


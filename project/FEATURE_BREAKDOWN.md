# SAHAYATA 2.0 - FEATURE BREAKDOWN

## Complete Implementation Guide by Feature

---

## 📋 TABLE OF CONTENTS

1. [Authentication System](#1-authentication-system)
2. [Dashboard & Care Management](#2-dashboard--care-management)
3. [Medical Records](#3-medical-records)
4. [Support Groups](#4-support-groups)
5. [Community Forum](#5-community-forum)
6. [Training Center](#6-training-center)
7. [Self-Care Center](#7-self-care-center)
8. [Notification System](#8-notification-system)
9. [Profile Management](#9-profile-management)
10. [Resource Hub](#10-resource-hub)
11. [Emergency Plan](#11-emergency-plan)
12. [Financial Resources](#12-financial-resources)
13. [Care Schedule](#13-care-schedule)
14. [Admin Panel](#14-admin-panel)

---

## 1. AUTHENTICATION SYSTEM

### 📁 Files Involved:

- **Backend:**
  - `server/routes/auth.ts` - Auth endpoints
  - `server/models/User.ts` - User schema
  - `server/middleware/auth.ts` - JWT verification
- **Frontend:**
  - `src/contexts/AuthContext.tsx` - Global auth state
  - `src/components/auth/AuthForm.tsx` - Login/signup form
  - `src/components/auth/ProtectedRoute.tsx` - Route protection
  - `src/components/auth/ForgotPasswordForm.tsx` - Password reset
  - `src/pages/Auth.tsx` - Auth page wrapper
  - `src/pages/ForgotPassword.tsx` - Password reset page

### 🔧 Implementation Details:

**User Schema:**

```typescript
{
  email: string (unique, indexed, required)
  passwordHash: string (bcrypt, required)
  fullName?: string
  role: 'caretaker' | 'patient' (default: 'caretaker')
  timestamps: { createdAt, updatedAt }
}
```

**API Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user info |

**Frontend Flow:**

1. User fills AuthForm
2. Submit → API call to `/api/auth/login` or `/api/auth/signup`
3. Receive JWT token
4. Store in localStorage
5. Update AuthContext state
6. Redirect to dashboard

**Protected Route Logic:**

```typescript
if (loading) return <Spinner />;
if (!user) return <Navigate to="/auth" />;
return children;
```

**Key Features:**

- ✅ Email normalization (lowercase, trim)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT with 7-day expiry
- ✅ Auto-refresh on mount
- ✅ Role-based access

---

## 2. DASHBOARD & CARE MANAGEMENT

### 📁 Files Involved:

- **Page:** `src/pages/Dashboard.tsx`
- **Components:**
  - `src/components/dashboard/AppointmentList.tsx`
  - `src/components/dashboard/MedicationList.tsx`
  - `src/components/dashboard/EmergencyContacts.tsx`
  - `src/components/dashboard/UpcomingReminders.tsx`
  - `src/components/care-tools/DailyRoutineBuilder.tsx`
  - `src/components/care-tools/SymptomTracker.tsx`
  - `src/components/care-tools/TaskForm.tsx`
  - `src/components/care-tools/TaskList.tsx`
- **Backend:**
  - `server/routes/appointments.ts`
  - `server/routes/routines.ts`
  - `server/routes/symptoms.ts`
  - `server/models/Appointment.ts`
  - `server/models/Routine.ts`
  - `server/models/Symptom.ts`

### 🔧 Implementation Details:

**Appointments Schema:**

```typescript
{
  userId: string (indexed)
  title: string
  description?: string
  date: string (YYYY-MM-DD)
  time: string (HH:MM)
  location?: string
  phoneNumber?: string
  reminderSent: boolean
  externalReminderSent: boolean
}
```

**Routines Schema:**

```typescript
{
  userId: string (indexed)
  title: string
  category: string (medication, meal, exercise, etc.)
  time: string (HH:MM)
  date: string (YYYY-MM-DD)
  description?: string
  reminderSent: boolean
  externalReminderSent: boolean
}
```

**Symptoms Schema:**

```typescript
{
  userId: string (indexed)
  type: string (pain, nausea, fatigue, etc.)
  severity: string (mild, moderate, severe)
  notes?: string
  date: string (YYYY-MM-DD)
}
```

**API Endpoints:**

_Appointments:_
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/appointments` | List user appointments |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |

_Routines:_
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/routines` | List user routines |
| POST | `/api/routines` | Create routine |
| PUT | `/api/routines/:id` | Update routine |
| DELETE | `/api/routines/:id` | Delete routine |

_Symptoms:_
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/symptoms` | List user symptoms |
| POST | `/api/symptoms` | Log symptom |
| DELETE | `/api/symptoms/:id` | Delete symptom |

**Key Features:**

- ✅ CRUD operations for appointments
- ✅ Daily routine builder
- ✅ Symptom logging and tracking
- ✅ Medication reminders
- ✅ Emergency contact display
- ✅ Upcoming reminders widget

**Dashboard Layout:**

```
┌─────────────────────────────────────────┐
│          Caretaker Dashboard            │
├──────────────────┬──────────────────────┤
│ Upcoming         │ Daily Routine        │
│ Reminders        │ Builder              │
├──────────────────┼──────────────────────┤
│ Appointments     │ Symptom Tracker      │
├──────────────────┤                      │
│ Medications      │                      │
├──────────────────┤                      │
│ Emergency        │                      │
│ Contacts         │                      │
└──────────────────┴──────────────────────┘
```

---

## 3. MEDICAL RECORDS

### 📁 Files Involved:

- **Frontend:** `src/pages/MedicalRecords.tsx`
- **Backend:**
  - `server/routes/medicalRecords.ts`
  - `server/models/MedicalRecord.ts`
- **Storage:** `uploads/` directory

### 🔧 Implementation Details:

**Schema:**

```typescript
{
  userId: string (indexed)
  date: string (YYYY-MM-DD)
  type: string (Lab Result, Prescription, etc.)
  description: string
  attachmentName?: string
  attachmentUrl?: string (path to file)
}
```

**File Upload Configuration:**

```typescript
const upload = multer({
  storage: diskStorage({
    destination: "uploads/",
    filename: `${Date.now()}-${Math.random()}-${originalname}`,
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: /jpeg|jpg|png|gif|pdf|doc|docx|txt/,
});
```

**API Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/medical-records` | List records |
| POST | `/api/medical-records` | Upload record |
| DELETE | `/api/medical-records/:id` | Delete record |
| GET | `/api/medical-records/file/:filename` | Download file |

**Security Flow:**

1. User uploads file with record details
2. Multer saves to `uploads/` with unique name
3. Database stores metadata + file path
4. To access file:
   - User requests file
   - Backend verifies JWT
   - Backend checks ownership (userId match)
   - If authorized, send file

**Frontend Upload:**

```typescript
const formData = new FormData();
formData.append("date", date);
formData.append("type", type);
formData.append("description", description);
formData.append("attachment", fileObject);

const token = localStorage.getItem("token");
await fetch("/api/medical-records", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

**Key Features:**

- ✅ Secure file upload
- ✅ File type validation
- ✅ Size limits (10MB)
- ✅ Authenticated access only
- ✅ User-specific records
- ✅ View/download functionality
- ✅ Delete with confirmation

---

## 4. SUPPORT GROUPS

### 📁 Files Involved:

- **Frontend:**
  - `src/pages/SupportGroups.tsx` - Main page
  - `src/components/support/GroupCard.tsx` - Group display
  - `src/components/support/GroupChat.tsx` - Chat interface
  - `src/components/support/ChatBot.tsx` - Onboarding chatbot
- **Backend:**
  - `server/routes/groups.ts` - Group endpoints
  - `server/routes/chats.ts` - Chat endpoints
  - `server/models/SupportGroup.ts` - Group schema
  - `server/models/GroupChat.ts` - Chat schema
  - `server/socket.ts` - Socket.IO setup

### 🔧 Implementation Details:

**Support Group Schema:**

```typescript
{
  name: string
  description: string
  schedule: string (e.g., "Every Monday 7 PM EST")
  createdBy: string (userId)
  members: string[] (array of userIds)
}
```

**Group Chat Schema:**

```typescript
{
  groupId: string(indexed);
  userId: string;
  message: string;
  createdAt: Date;
}
```

**API Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/groups` | List all groups + membership status |
| POST | `/api/groups` | Create new group |
| POST | `/api/groups/:id/toggle` | Join/leave group |
| GET | `/api/chats/:groupId` | Get group messages |
| POST | `/api/chats/:groupId` | Send message |

**Real-time Chat Implementation:**

```typescript
// Server
io.on("connection", (socket) => {
  socket.on("join-group", (groupId) => {
    socket.join(`group:${groupId}`);
  });

  // When message sent
  io.to(`group:${groupId}`).emit("message", {
    userId,
    message,
    timestamp,
  });
});

// Client
socket.emit("join-group", groupId);
socket.on("message", (data) => {
  // Update UI with new message
});
```

**Profile Requirement Check:**

```typescript
const profile = await ProfileModel.findOne({ userId });
if (!profile?.is_profile_complete) {
  return navigate("/profile");
}
```

**ChatBot Onboarding:**

- 2-question conversation
- Stores responses in localStorage
- Auto-joins group after completion
- Friendly, conversational tone

**Key Features:**

- ✅ Create/join/leave groups
- ✅ Real-time chat (Socket.IO)
- ✅ Member count tracking
- ✅ Profile completeness requirement
- ✅ Chatbot onboarding
- ✅ Schedule display
- ✅ Beautiful UI with background images

---

## 5. COMMUNITY FORUM

### 📁 Files Involved:

- **Frontend:** `src/pages/CommunityForum.tsx`
- **Storage:** LocalStorage (client-side)

### 🔧 Implementation Details:

**Data Structures:**

```typescript
interface ForumPost {
  id: string
  author: string
  authorEmail: string
  title: string
  content: string
  date: string (ISO)
  likes: number
  category: string
  replies: ForumReply[]
}

interface ForumReply {
  id: string
  author: string
  authorEmail: string
  content: string
  date: string (ISO)
  likes: number
}
```

**LocalStorage Keys:**

- `forumPosts` - Array of all posts
- `forumLikes` - Array of liked post IDs
- `forumReplyLikes` - Array of liked reply IDs (format: `postId-replyId`)

**Categories:**

1. General
2. Caregiving Tips
3. Medication
4. Mental Health
5. Support
6. Resources

**Features:**

- ✅ Create posts with title, content, category
- ✅ Reply to posts
- ✅ Like/unlike posts and replies
- ✅ Search by title/content
- ✅ Filter by category
- ✅ Relative timestamps ("5 minutes ago")
- ✅ Bilingual content (Hindi + English)
- ✅ User attribution with auth context

**Time Formatting:**

```typescript
const diffMins = (now - postDate) / 60000;
if (diffMins < 60) return `${diffMins} minutes ago`;
if (diffHours < 24) return `${diffHours} hours ago`;
if (diffDays < 7) return `${diffDays} days ago`;
return date.toLocaleDateString();
```

**Search Implementation:**

```typescript
const filteredPosts = posts.filter((post) => {
  const matchesSearch =
    post.title.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm);
  const matchesCategory =
    selectedCategory === "All" || post.category === selectedCategory;
  return matchesSearch && matchesCategory;
});
```

**Key Features:**

- ✅ Fully client-side (no backend)
- ✅ Instant loading
- ✅ Persistent across sessions
- ✅ Search and filter
- ✅ Nested replies
- ✅ Like system
- ✅ Auth required to post/reply
- ✅ Bilingual (Hindi + English)

**Sample Default Post:**

```typescript
{
  title: "बुजुर्गों की दवाई का ध्यान कैसे रखें? | Managing Medication for Elderly",
  content: "मुझे अपनी मां की 5 अलग-अलग दवाइयों का ध्यान रखना पड़ता है...",
  category: "Medication"
}
```

---

## 6. TRAINING CENTER

### 📁 Files Involved:

- **Frontend:** `src/pages/Training.tsx`
- **Storage:** LocalStorage for progress tracking

### 🔧 Implementation Details:

**Data Structure:**

```typescript
interface TrainingVideo {
  id: string
  title: string
  description: string
  duration: string
  videoUrl: string (YouTube embed URL)
  thumbnail: string (YouTube thumbnail URL)
  completed?: boolean
}
```

**LocalStorage:**

- Key: `completedTrainingVideos`
- Value: Array of video IDs

**Current Videos:**

1. **Elderly Care at Home** (8:45)

   - YouTube ID: 1RKVajOLdLM
   - Hindi language
   - Complete guide to elderly care

2. **Home Nursing Care** (10:15)

   - YouTube ID: HLGzMgQrlWs
   - Patient care tips
   - Bed bathing, handling

3. **CPR Training** (6:30)
   - YouTube ID: hTS6gtaTHcI
   - Indian Red Cross
   - First aid techniques

**YouTube Embed:**

```typescript
<iframe
  src={`${videoUrl}?autoplay=1&rel=0&modestbranding=1`}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media"
  allowFullScreen
  className="absolute inset-0 w-full h-full"
/>
```

**Progress Tracking:**

```typescript
const markAsComplete = (videoId) => {
  const updated = [...completedVideos, videoId];
  setCompletedVideos(updated);
  localStorage.setItem("completedTrainingVideos", JSON.stringify(updated));
};
```

**Statistics:**

- Available Videos: Total count
- Completed: Filtered count where completed = true
- In Progress: Total - Completed

**Key Features:**

- ✅ YouTube embedded player
- ✅ Progress tracking
- ✅ Completion marking
- ✅ Direct YouTube links (for restricted videos)
- ✅ Thumbnail previews
- ✅ Duration display
- ✅ Hindi language content
- ✅ Statistics dashboard

**UI Layout:**

```
┌─────────────────────────────────────────┐
│         Training Center 🎓               │
├─────────────┬─────────────┬─────────────┤
│ Available:3 │ Completed:1 │ Progress:2  │
├─────────────────────────────────────────┤
│                                          │
│     [ Active Video Player ]              │
│                                          │
├─────────────────────────────────────────┤
│  [Video 1]   [Video 2]   [Video 3]      │
│  Thumbnail   Thumbnail   Thumbnail       │
└─────────────────────────────────────────┘
```

---

## 7. SELF-CARE CENTER

### 📁 Files Involved:

- **Frontend:**
  - `src/pages/SelfCare.tsx` - Main page
  - `src/components/self-care/ActivityCard.tsx` - Activity display
  - `src/components/self-care/MoodTracker.tsx` - Mood logging

### 🔧 Implementation Details:

**Activities:**

```typescript
[
  {
    title: "Guided Meditation",
    duration: "10 minutes",
    description: "Calming meditation for stress reduction",
    type: "Mindfulness",
  },
  {
    title: "Gentle Yoga",
    duration: "20 minutes",
    description: "Easy stretching exercises",
    type: "Exercise",
  },
  {
    title: "Journaling Session",
    duration: "15 minutes",
    description: "Guided prompts for reflection",
    type: "Emotional Wellness",
  },
];
```

**Mood Tracker:**

- Allows caretakers to log daily mood
- Visual indicators (emojis/colors)
- Track mood over time
- Identify patterns

**Page Design:**

- Beautiful background image
- Semi-transparent overlay
- Activity cards in grid
- Mood tracker at top

**Key Features:**

- ✅ Focus on caretaker wellbeing
- ✅ Multiple activity types
- ✅ Mood tracking
- ✅ Beautiful, calming UI
- ✅ Quick activities (10-20 min)
- ✅ Emotional wellness emphasis

---

## 8. NOTIFICATION SYSTEM

### 📁 Files Involved:

- **Backend:**
  - `server/index.ts` - Cron jobs, email/SMS setup
  - `server/routes/notifications.ts` - Notification endpoints
  - `server/models/Notification.ts` - Notification schema
- **Frontend:**
  - `src/components/layout/NotificationDropdown.tsx` - UI display

### 🔧 Implementation Details:

**Notification Schema:**

```typescript
{
  userId: string (indexed)
  type: 'appointment' | 'routine'
  title: string
  message: string
  data: object (e.g., { appointmentId })
  read: boolean
  createdAt: Date
}
```

**Cron Jobs:**

```typescript
// Every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  // 1. Query appointments/routines in next 60 minutes
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60000);

  // 2. Filter candidates
  const candidates = await AppointmentModel.find({
    date: { $in: [today, soon] },
    reminderSent: false,
  });

  // 3. Calculate time difference
  const toNotify = candidates.filter((item) => {
    const when = new Date(`${item.date}T${item.time}:00`);
    const diffMin = (when - now) / 60000;
    return diffMin >= 0 && diffMin <= 60;
  });

  // 4. Create in-app notifications
  await NotificationModel.insertMany(
    toNotify.map((item) => ({
      userId: item.userId,
      type: "appointment",
      title: "Upcoming appointment",
      message: `${item.title} at ${item.time}`,
      read: false,
    }))
  );

  // 5. Send external notifications
  for (const item of toNotify) {
    const profile = await ProfileModel.findOne({ userId: item.userId });
    await sendEmail(profile.email, subject, text);
    await sendSms(profile.phoneNumber, text);
  }

  // 6. Mark as sent
  await AppointmentModel.updateMany(
    { _id: { $in: toNotify.map((a) => a._id) } },
    { $set: { reminderSent: true } }
  );
});
```

**Email Setup (Nodemailer):**

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: userEmail,
  subject: "Upcoming Appointment",
  text: "Your appointment is in 1 hour...",
});
```

**SMS Setup (Twilio):**

```typescript
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const formattedPhone = formatPhoneNumber(phone); // +919876543210

await client.messages.create({
  from: process.env.TWILIO_FROM,
  to: formattedPhone,
  body: "Reminder: Appointment in 1 hour...",
});
```

**Phone Formatting:**

```typescript
const formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned; // Add India code
  }
  return "+" + cleaned; // E.164
};
```

**Socket.IO Real-time Delivery:**

```typescript
// User joins notification room
socket.join(`notifications:${userId}`);

// Emit notification
io.to(`notifications:${userId}`).emit("notification", {
  id,
  type,
  title,
  message,
  timestamp,
});
```

**API Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | List user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/test` | Test email+SMS |

**Debug Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/test-sms` | Test Twilio SMS |
| POST | `/api/trigger-appointment-check` | Manual cron trigger |

**Key Features:**

- ✅ Multi-channel (In-app + Email + SMS)
- ✅ Automated (cron every 5 min)
- ✅ 60-minute advance warning
- ✅ Real-time delivery (Socket.IO)
- ✅ Phone number formatting (E.164)
- ✅ Duplicate prevention (reminderSent flag)
- ✅ Batch processing
- ✅ Error handling (don't fail entire batch)

---

## 9. PROFILE MANAGEMENT

### 📁 Files Involved:

- **Frontend:** `src/pages/Profile.tsx`
- **Backend:**
  - `server/routes/profiles.ts`
  - `server/models/Profile.ts`
- **Library:** `src/lib/supabase.ts` (profile helpers)

### 🔧 Implementation Details:

**Profile Schema:**

```typescript
{
  userId: string (unique, indexed)
  full_name: string
  phone: string
  address: string
  emergency_contact: string
  medical_conditions: string[]
  is_profile_complete: boolean
  email: string
  role: 'caretaker' | 'patient'
}
```

**Completeness Logic:**

```typescript
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

**API Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/profiles` | Get current user profile |
| POST | `/api/profiles` | Create/update profile |

**Medical Conditions Management:**

```typescript
// Add condition
const add = () => {
  setProfile({
    ...profile,
    medical_conditions: [...profile.medical_conditions, newCondition],
  });
};

// Remove condition
const remove = (index) => {
  setProfile({
    ...profile,
    medical_conditions: profile.medical_conditions.filter(
      (_, i) => i !== index
    ),
  });
};
```

**Usage of Profile Completeness:**

1. **Support Groups:** Block joining if incomplete
2. **Notifications:** Required for SMS/email delivery
3. **UI Feedback:** Show completion badge
4. **Feature Gating:** Can expand to other features

**Key Features:**

- ✅ Required fields validation
- ✅ Completeness tracking
- ✅ Medical conditions array
- ✅ Emergency contact
- ✅ Phone number for notifications
- ✅ Role display
- ✅ Visual feedback (badges)

---

## 10. RESOURCE HUB

### 📁 Files Involved:

- **Frontend:**
  - `src/pages/ResourceHub.tsx`
  - `src/components/resources/ResourceCard.tsx`
  - `src/components/resources/CategoryFilter.tsx`
  - `src/components/resources/SearchBar.tsx`

### 🔧 Implementation Details:

**Resource Categories:**

- Medical Information
- Financial Aid
- Legal Guidance
- Support Services
- Educational Content
- Caregiver Tips

**Features:**

- Search by keyword
- Filter by category
- Resource cards with:
  - Title
  - Description
  - Category tag
  - Link/CTA button

**Key Features:**

- ✅ Categorized resources
- ✅ Search functionality
- ✅ Filter by category
- ✅ External links
- ✅ Educational content
- ✅ Financial resources
- ✅ Legal information

---

## 11. EMERGENCY PLAN

### 📁 Files Involved:

- **Frontend:** `src/pages/EmergencyPlan.tsx`

### 🔧 Implementation Details:

**Sections:**

1. **Emergency Contacts:**
   - Primary care doctor
   - Hospital
   - Ambulance
   - Family members
2. **Emergency Protocols:**
   - Step-by-step procedures
   - When to call 911
   - What information to have ready
3. **Hospital Information:**
   - Nearest hospitals
   - Preferred hospital
   - Insurance details
4. **Critical Medical Info:**
   - Allergies
   - Current medications
   - Medical conditions
   - Blood type

**Key Features:**

- ✅ Quick access to critical info
- ✅ Emergency protocols
- ✅ Hospital details
- ✅ Medical history summary
- ✅ Contact information
- ✅ Printable format

---

## 12. FINANCIAL RESOURCES

### 📁 Files Involved:

- **Frontend:** `src/pages/FinancialResources.tsx`

### 🔧 Implementation Details:

**Sections:**

1. **Insurance Guidance:**
   - Understanding coverage
   - Claims process
   - Documentation needed
2. **Financial Aid Programs:**
   - Government programs
   - Non-profit organizations
   - Hospital financial assistance
3. **Cost Management:**
   - Medication costs
   - Treatment costs
   - Home care costs
4. **Billing Support:**
   - Understanding bills
   - Negotiating costs
   - Payment plans

**Key Features:**

- ✅ Insurance information
- ✅ Aid programs
- ✅ Cost management tips
- ✅ Billing guidance
- ✅ Resource links

---

## 13. CARE SCHEDULE

### 📁 Files Involved:

- **Frontend:** `src/pages/CareSchedule.tsx`

### 🔧 Implementation Details:

**Features:**

- Calendar view
- Daily schedule
- Weekly overview
- Appointment display
- Routine tasks
- Medication schedule

**Views:**

1. **Day View:** Hour-by-hour schedule
2. **Week View:** 7-day overview
3. **Month View:** Full month calendar

**Color Coding:**

- Appointments (blue)
- Medications (green)
- Routines (yellow)
- Symptoms logged (red)

**Key Features:**

- ✅ Multiple calendar views
- ✅ Color-coded events
- ✅ Click to view details
- ✅ Add new items
- ✅ Integrated with other modules

---

## 14. ADMIN PANEL

### 📁 Files Involved:

- **Frontend:** `src/pages/AdminPanel.tsx`

### 🔧 Implementation Details:

**Sections:**

1. **User Management:**
   - List all users
   - View user details
   - Moderate accounts
2. **Content Moderation:**
   - Forum posts
   - Support groups
   - Reported content
3. **Analytics:**
   - User statistics
   - Feature usage
   - Engagement metrics
4. **System Health:**
   - Server status
   - Database status
   - Error logs

**Key Features:**

- ✅ User management
- ✅ Content moderation
- ✅ Analytics dashboard
- ✅ System monitoring
- ✅ Role-based access

---

## 🔗 FEATURE DEPENDENCIES

```
Authentication
    ↓
Profile
    ↓
┌───────────┬──────────────┬─────────────┬──────────┐
│           │              │             │          │
Support   Dashboard    Medical     Forum    Training
Groups                Records
    ↓
Notifications (Email/SMS)
```

**Profile Required For:**

- Joining support groups
- Receiving SMS notifications
- Creating forum posts

**Authentication Required For:**

- All features except Home and About

---

## 📊 FEATURE COMPLETION MATRIX

| Feature         | Backend | Frontend | Real-time    | External API     | Status   |
| --------------- | ------- | -------- | ------------ | ---------------- | -------- |
| Authentication  | ✅      | ✅       | -            | -                | Complete |
| Dashboard       | ✅      | ✅       | -            | -                | Complete |
| Medical Records | ✅      | ✅       | -            | -                | Complete |
| Support Groups  | ✅      | ✅       | ✅ Socket.IO | -                | Complete |
| Forum           | -       | ✅       | -            | -                | Complete |
| Training        | -       | ✅       | -            | ✅ YouTube       | Complete |
| Self-Care       | -       | ✅       | -            | -                | Complete |
| Notifications   | ✅      | ✅       | ✅ Socket.IO | ✅ Twilio, Email | Complete |
| Profile         | ✅      | ✅       | -            | -                | Complete |
| Resource Hub    | -       | ✅       | -            | -                | Complete |
| Emergency Plan  | -       | ✅       | -            | -                | Complete |
| Financial       | -       | ✅       | -            | -                | Complete |
| Care Schedule   | -       | ✅       | -            | -                | Complete |
| Admin Panel     | -       | ✅       | -            | -                | Complete |

---

## 🎯 FEATURE PRIORITIES

**Core (MVP):**

1. Authentication
2. Dashboard
3. Appointments
4. Notifications

**Important:** 5. Support Groups 6. Medical Records 7. Profile 8. Forum

**Nice to Have:** 9. Training 10. Self-Care 11. Resource Hub 12. Emergency Plan

**Admin:** 13. Admin Panel

---

## 📝 FEATURE USAGE SCENARIOS

### Scenario 1: New User Onboarding

1. Sign up → Auth
2. Complete profile → Profile
3. Add first appointment → Dashboard
4. Receive notification → Notifications
5. Upload medical record → Medical Records
6. Join support group → Support Groups

### Scenario 2: Daily Use

1. Check dashboard → Dashboard
2. Log symptom → Symptom Tracker
3. Mark routine complete → Daily Routine Builder
4. Check notifications → Notification Dropdown
5. Chat in support group → Group Chat

### Scenario 3: Community Engagement

1. Read forum posts → Community Forum
2. Reply to discussion → Forum
3. Watch training video → Training Center
4. Log mood → Self-Care

---

**This document provides a complete feature-by-feature breakdown of the entire application. Use it to quickly locate any implementation detail during your interview!**


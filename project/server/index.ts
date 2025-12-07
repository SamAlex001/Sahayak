import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { setIo } from "./socket";
import cron from "node-cron";
import { RoutineModel } from "./models/Routine";
import { ProfileModel } from "./models/Profile";
import { AppointmentModel } from "./models/Appointment";
import { NotificationModel } from "./models/Notification";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profiles";
import chatRoutes from "./routes/chats";
import { requireAuth, AuthRequest } from "./middleware/auth";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sahayata";
const PORT = process.env.PORT || 4000;

console.log("Starting server with MONGO_URI:", MONGO_URI);
console.log("Starting server on PORT:", PORT);

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  const app = express();
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });
  setIo(io);
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Test SMS endpoint - for debugging
  app.post("/api/test-sms", async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "phoneNumber required" });
      }

      const testMessage =
        message || "🧪 Test SMS from Sahayata - SMS functionality is working!";
      await sendSms(phoneNumber, testMessage);
      res.json({
        success: true,
        message: "SMS sent successfully",
        phoneNumber,
        testMessage,
      });
    } catch (error) {
      console.error("Test SMS failed:", error);
      res.status(500).json({
        error: "Failed to send test SMS",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Manual trigger for appointment reminders - for debugging
  app.post("/api/trigger-appointment-check", async (req, res) => {
    try {
      console.log("🔧 Manual appointment reminder check triggered");

      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60000);
      const toISODate = (d: Date) => d.toISOString().slice(0, 10);
      const today = toISODate(now);
      const soon = toISODate(inOneHour);

      const candidates = await AppointmentModel.find({
        date: { $in: [today, soon] },
        reminderSent: false,
      }).lean();

      console.log(
        `📋 Found ${candidates.length} appointment candidates for reminder check`
      );

      const shouldNotify = (appt: {
        date: string;
        time: string;
        title: string;
        phoneNumber?: string;
      }) => {
        const when = new Date(`${appt.date}T${appt.time}:00`);
        const diffMin = (when.getTime() - now.getTime()) / 60000;
        const shouldSend = diffMin >= 0 && diffMin <= 60;
        if (shouldSend) {
          console.log(
            `⏰ Appointment "${appt.title}" is ${diffMin.toFixed(
              1
            )} minutes away - scheduling SMS`
          );
        }
        return shouldSend;
      };

      const toNotify = candidates.filter(shouldNotify);
      console.log(`📱 ${toNotify.length} appointments need SMS reminders`);

      res.json({
        success: true,
        message: "Appointment check completed",
        candidates: candidates.length,
        toNotify: toNotify.length,
        appointments: toNotify.map((a) => ({
          title: a.title,
          date: a.date,
          time: a.time,
          phoneNumber: a.phoneNumber,
        })),
      });
    } catch (error) {
      console.error("Manual appointment check failed:", error);
      res.status(500).json({
        error: "Failed to check appointments",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Quick test endpoint to trigger external notifications for the current user
  app.post(
    "/api/notifications/test",
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const profile = await ProfileModel.findOne({ userId }).lean();
        if (!profile)
          return res.status(404).json({ error: "profile not found" });
        const attempts: { email?: string; phoneNumber?: string } = {};
        const subject = "Sahayata Test Notification";
        const text = "This is a test notification from Sahayata.";
        if (profile.email) {
          attempts.email = profile.email;
          await sendEmail(profile.email, subject, text);
        }
        if (profile.phoneNumber && process.env.TWILIO_FROM) {
          attempts.phoneNumber = profile.phoneNumber;
          await sendSms(profile.phoneNumber, text);
        }
        if (!attempts.email && !attempts.phoneNumber) {
          return res
            .status(400)
            .json({ error: "No email or phoneNumber on profile to send test" });
        }
        return res.json({ ok: true, attempts });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Test notification failed:", message);
        return res
          .status(500)
          .json({ error: "failed to send test notification", message });
      }
    }
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/profiles", profileRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/appointments", (await import("./routes/appointments")).default);
  app.use("/api/routines", (await import("./routes/routines")).default);
  app.use("/api/symptoms", (await import("./routes/symptoms")).default);
  app.use("/api/groups", (await import("./routes/groups")).default);
  app.use(
    "/api/notifications",
    (await import("./routes/notifications")).default
  );
  app.use(
    "/api/medical-records",
    (await import("./routes/medicalRecords")).default
  );

  io.on("connection", (socket) => {
    socket.on("join-group", (groupId: string) => {
      socket.join(`group:${groupId}`);
    });

    socket.on("join-notifications", (userId: string) => {
      socket.join(`notifications:${userId}`);
    });
  });

  // Email/SMS transporters (lazy import to avoid type deps)
  let mailTransport: {
    sendMail: (opts: {
      from: string;
      to: string;
      subject: string;
      text: string;
    }) => Promise<unknown>;
  } | null = null;
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = (await import("nodemailer")).default as {
        createTransport: (opts: unknown) => {
          sendMail: (opts: {
            from: string;
            to: string;
            subject: string;
            text: string;
          }) => Promise<unknown>;
        };
      };
      mailTransport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      });
      console.log("Email transport initialized successfully");
    } catch (error) {
      console.warn("Failed to initialize email transport:", error);
      mailTransport = null;
    }
  } else {
    console.log(
      "SMTP configuration not provided - email notifications disabled"
    );
  }

  let smsClient: {
    messages: {
      create: (opts: {
        from: string;
        to: string;
        body: string;
      }) => Promise<unknown>;
    };
  } | null = null;
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith("AC")
  ) {
    try {
      const twilio = (await import("twilio")).default as unknown as (
        sid: string,
        token: string
      ) => {
        messages: {
          create: (opts: {
            from: string;
            to: string;
            body: string;
          }) => Promise<unknown>;
        };
      };
      smsClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log("Twilio SMS client initialized successfully");
    } catch (error) {
      console.warn("Failed to initialize Twilio SMS client:", error);
      smsClient = null;
    }
  } else {
    console.log(
      "Twilio credentials not provided or invalid - SMS notifications disabled"
    );
  }

  const sendEmail = async (to: string, subject: string, text: string) => {
    if (!mailTransport) return;
    try {
      await mailTransport.sendMail({
        from: process.env.SMTP_FROM || "no-reply@sahayata.local",
        to,
        subject,
        text,
      });
    } catch {
      // ignore email failures
    }
  };

  // Format phone number to E.164 format
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // If it doesn't start with +, add country code
    if (!phone.startsWith("+")) {
      // If it's a 10-digit Indian number, add +91
      if (cleaned.length === 10) {
        cleaned = "91" + cleaned;
      }
      // If it doesn't have country code, assume India (+91)
      if (!cleaned.startsWith("91") && cleaned.length === 10) {
        cleaned = "91" + cleaned;
      }
    }

    return "+" + cleaned;
  };

  const sendSms = async (to: string, body: string) => {
    if (!smsClient || !process.env.TWILIO_FROM) return;
    try {
      const formattedPhone = formatPhoneNumber(to);
      console.log(`📞 Formatted phone: ${to} -> ${formattedPhone}`);

      await smsClient.messages.create({
        from: process.env.TWILIO_FROM,
        to: formattedPhone,
        body,
      });
    } catch (error) {
      console.error(`❌ SMS send failed:`, error);
      // ignore sms failures
    }
  };

  // Every 5 minutes, create reminders for appointments within next 60 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("🕐 Running appointment reminder check...");
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60000);
    const toISODate = (d: Date) => d.toISOString().slice(0, 10);
    const today = toISODate(now);
    const soon = toISODate(inOneHour);

    const candidates = await AppointmentModel.find({
      date: { $in: [today, soon] },
      reminderSent: false,
    }).lean();

    console.log(
      `📋 Found ${candidates.length} appointment candidates for reminder check`
    );

    const shouldNotify = (appt: {
      date: string;
      time: string;
      title: string;
      phoneNumber?: string;
    }) => {
      const when = new Date(`${appt.date}T${appt.time}:00`);
      const diffMin = (when.getTime() - now.getTime()) / 60000;
      const shouldSend = diffMin >= 0 && diffMin <= 60;
      if (shouldSend) {
        console.log(
          `⏰ Appointment "${appt.title}" is ${diffMin.toFixed(
            1
          )} minutes away - scheduling SMS`
        );
      }
      return shouldSend;
    };

    const toNotify = candidates.filter(shouldNotify);
    console.log(`📱 ${toNotify.length} appointments need SMS reminders`);
    if (toNotify.length) {
      await NotificationModel.insertMany(
        toNotify.map((a) => ({
          userId: a.userId,
          type: "appointment",
          title: "Upcoming appointment",
          message:
            `${a.title} at ${a.time}` + (a.location ? ` (${a.location})` : ""),
          data: { appointmentId: a._id },
          read: false,
        }))
      );
      await AppointmentModel.updateMany(
        { _id: { $in: toNotify.map((a) => a._id) } },
        { $set: { reminderSent: true } }
      );

      // External notifications (email/SMS)
      for (const appt of toNotify) {
        console.log(`📞 Processing SMS for appointment: "${appt.title}"`);
        const profile = await ProfileModel.findOne({
          userId: appt.userId,
        }).lean();
        if (!profile) {
          console.log(`❌ No profile found for user ${appt.userId}`);
          continue;
        }
        const subject = "Upcoming Appointment Reminder";
        const text =
          `📅 Sahayata Reminder: ${appt.title} at ${appt.time}` +
          (appt.location ? ` (${appt.location})` : "") +
          ` - Don't forget your appointment!`;

        // Send email to user's profile email
        if (profile.email) {
          await sendEmail(profile.email, subject, text);
          console.log(
            `📧 Email sent to ${profile.email} for appointment: ${appt.title}`
          );
        }

        // Send SMS to appointment-specific phone number (if provided) or fallback to profile phone
        const phoneToUse = appt.phoneNumber || profile.phoneNumber;
        console.log(
          `📱 Phone numbers - Appointment: ${
            appt.phoneNumber || "none"
          }, Profile: ${profile.phoneNumber || "none"}`
        );
        console.log(`📱 Using phone number: ${phoneToUse || "none"}`);

        if (phoneToUse) {
          try {
            await sendSms(phoneToUse, text);
            console.log(
              `✅ SMS sent successfully to ${phoneToUse} for appointment: ${appt.title}`
            );
          } catch (error) {
            console.error(
              `❌ SMS failed to ${phoneToUse} for appointment: ${appt.title}`,
              error
            );
          }
        } else {
          console.log(
            `❌ No phone number available for appointment: ${appt.title}`
          );
        }
      }
      await AppointmentModel.updateMany(
        { _id: { $in: toNotify.map((a) => a._id) } },
        { $set: { externalReminderSent: true } }
      );
    }
  });

  // Every 5 minutes, routine reminders for next 60 minutes
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60000);
    const toISODate = (d: Date) => d.toISOString().slice(0, 10);
    const today = toISODate(now);
    const soon = toISODate(inOneHour);

    const candidates = await RoutineModel.find({
      date: { $in: [today, soon] },
      reminderSent: false,
    }).lean();

    const shouldNotify = (r: { date: string; time: string }) => {
      const when = new Date(`${r.date}T${r.time}:00`);
      const diffMin = (when.getTime() - now.getTime()) / 60000;
      return diffMin >= 0 && diffMin <= 60;
    };

    const toNotify = candidates.filter(shouldNotify);
    if (toNotify.length) {
      await NotificationModel.insertMany(
        toNotify.map((r) => ({
          userId: r.userId,
          type: "routine",
          title: "Routine Reminder",
          message:
            `${r.title} (${r.category}) at ${r.time}` +
            (r.description ? ` - ${r.description}` : ""),
          data: { routineId: r._id },
          read: false,
        }))
      );
      await RoutineModel.updateMany(
        { _id: { $in: toNotify.map((r) => r._id) } },
        { $set: { reminderSent: true } }
      );

      // External notifications (email/SMS)
      for (const r of toNotify) {
        const profile = await ProfileModel.findOne({ userId: r.userId }).lean();
        if (!profile) continue;
        const subject = "Routine Reminder";
        const text =
          `${r.title} (${r.category}) at ${r.time}` +
          (r.description ? ` - ${r.description}` : "");
        if (profile.email) await sendEmail(profile.email, subject, text);
        if (profile.phoneNumber) await sendSms(profile.phoneNumber, text);
      }
      await RoutineModel.updateMany(
        { _id: { $in: toNotify.map((r) => r._id) } },
        { $set: { externalReminderSent: true } }
      );
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});

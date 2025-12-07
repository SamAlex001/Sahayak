import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { AppointmentModel } from "../models/Appointment";
import { ProfileModel } from "../models/Profile";

const router = Router();

// Initialize Twilio client
let smsClient: any = null;
const initSmsClient = async () => {
  if (smsClient) return smsClient;

  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith("AC")
  ) {
    try {
      const twilio = (await import("twilio")).default;
      smsClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log("✅ Twilio SMS client initialized in appointments route");
    } catch (error) {
      console.error("❌ Failed to initialize Twilio SMS client:", error);
    }
  }
  return smsClient;
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

// Send SMS helper function
const sendSms = async (phoneNumber: string, message: string) => {
  const client = await initSmsClient();
  if (!client || !process.env.TWILIO_FROM) {
    console.log("⚠️  SMS not sent - Twilio not configured");
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`📞 Formatted phone: ${phoneNumber} -> ${formattedPhone}`);

    await client.messages.create({
      from: process.env.TWILIO_FROM,
      to: formattedPhone,
      body: message,
    });
    console.log(`✅ SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error(`❌ SMS failed to ${phoneNumber}:`, error);
    return false;
  }
};

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { limit } = req.query;
  const query = AppointmentModel.find({ userId: req.userId! }).sort({
    date: 1,
    time: 1,
  });
  if (limit) query.limit(Number(limit));
  const items = await query.lean();
  res.json(items);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { title, description, date, time, location, phoneNumber } =
    req.body || {};
  if (!title || !date || !time)
    return res.status(400).json({ error: "title, date, time required" });

  const created = await AppointmentModel.create({
    userId: req.userId!,
    title,
    description,
    date,
    time,
    location,
    phoneNumber,
  });

  // Send immediate SMS confirmation
  try {
    console.log(
      `📋 Appointment phone number from request: ${
        phoneNumber || "not provided"
      }`
    );

    // Get user profile for fallback phone number
    const profile = await ProfileModel.findOne({ userId: req.userId! }).lean();
    console.log(
      `👤 Profile phone number: ${profile?.phoneNumber || "not found"}`
    );

    // Use appointment phone number FIRST, then fallback to profile phone
    const phoneToUse = phoneNumber || profile?.phoneNumber;
    console.log(
      `📞 Phone number to use for SMS: ${phoneToUse || "none available"}`
    );

    if (phoneToUse) {
      const smsMessage =
        `✅ Appointment Scheduled!\n\n` +
        `📅 ${title}\n` +
        `🕐 ${date} at ${time}\n` +
        (location ? `📍 ${location}\n` : "") +
        `\nYou will receive a reminder 60 minutes before your appointment.\n` +
        `- Sahayata`;

      console.log(`📱 Sending appointment confirmation SMS to ${phoneToUse}`);
      await sendSms(phoneToUse, smsMessage);
    } else {
      console.log(`⚠️  No phone number available for appointment confirmation`);
    }
  } catch (error) {
    console.error("Failed to send appointment confirmation SMS:", error);
    // Don't fail the request if SMS fails
  }

  res.status(201).json(created);
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  await AppointmentModel.deleteOne({ _id: id, userId: req.userId! });
  res.status(204).send();
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, description, date, time, location, phoneNumber } =
    req.body || {};
  const updated = await AppointmentModel.findOneAndUpdate(
    { _id: id, userId: req.userId! },
    { $set: { title, description, date, time, location, phoneNumber } },
    { new: true }
  ).lean();
  if (!updated) return res.status(404).json({ error: "not found" });
  res.json(updated);
});

export default router;

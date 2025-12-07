import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { GroupMessageModel } from "../models/GroupChat";
import { getIo } from "../socket";
import { SupportGroupModel } from "../models/SupportGroup";
import { NotificationModel } from "../models/Notification";
import { ProfileModel } from "../models/Profile";

const router = Router();

router.get("/:groupId", requireAuth, async (req: AuthRequest, res) => {
  const { groupId } = req.params;
  const messages = await GroupMessageModel.find({ groupId })
    .sort({ createdAt: 1 })
    .lean();

  // Get user profiles for all messages
  const userIds = [...new Set(messages.map((m) => m.userId))];
  const profiles = await ProfileModel.find({ userId: { $in: userIds } }).lean();
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  // Add profile information to messages
  const messagesWithProfiles = messages.map((message) => ({
    ...message,
    userProfile: profileMap.get(message.userId) || null,
  }));

  res.json(messagesWithProfiles);
});

router.post("/:groupId", requireAuth, async (req: AuthRequest, res) => {
  const { groupId } = req.params;
  const { message } = req.body || {};
  if (!message || !message.trim())
    return res.status(400).json({ error: "message required" });
  const created = await GroupMessageModel.create({
    groupId,
    userId: req.userId!,
    message: message.trim(),
  });

  // Get user profile for the message
  const userProfile = await ProfileModel.findOne({
    userId: req.userId!,
  }).lean();
  const messageWithProfile = {
    ...created.toObject(),
    userProfile: userProfile || null,
  };

  const io = getIo();
  io.to(`group:${groupId}`).emit("group-message", messageWithProfile);
  // notify other members
  const group = await SupportGroupModel.findById(groupId).lean();
  if (group) {
    const recipients = (group.members || []).filter((m) => m !== req.userId);
    const notifications = await NotificationModel.insertMany(
      recipients.map((userId) => ({
        userId,
        type: "chat",
        title: "New group message",
        message: created.message,
        data: { groupId, messageId: created._id },
        read: false,
      }))
    );
    // Emit real-time notifications
    recipients.forEach((userId, index) => {
      io.to(`notifications:${userId}`).emit(
        "notification",
        notifications[index]
      );
    });
  }
  res.status(201).json(messageWithProfile);
});

export default router;

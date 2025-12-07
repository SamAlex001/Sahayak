import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { ProfileModel } from "../models/Profile";
import { UserModel } from "../models/User";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  let profile = await ProfileModel.findOne({ userId }).lean();
  if (!profile) {
    const user = await UserModel.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "user not found" });
    profile = (
      await ProfileModel.create({
        userId,
        email: user.email,
        role: user.role,
        isProfileComplete: false,
      })
    ).toObject();
  }
  return res.json(profile);
});

router.put("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { fullName, role, isProfileComplete, phoneNumber } = req.body || {};
  const updated = await ProfileModel.findOneAndUpdate(
    { userId },
    { $set: { fullName, role, isProfileComplete, phoneNumber } },
    { new: true, upsert: true }
  ).lean();
  return res.json(updated);
});

export default router;

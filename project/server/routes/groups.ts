import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { SupportGroupModel } from "../models/SupportGroup";
import { ProfileModel } from "../models/Profile";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const items = await SupportGroupModel.find({}).lean();
  res.json(
    items.map((g) => ({
      id: g._id,
      name: g.name,
      description: g.description,
      schedule: g.schedule,
      participants: g.members.length,
      isMember: (g.members || []).includes(req.userId!),
    }))
  );
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  // Ensure profile is complete before allowing group creation
  const profile = await ProfileModel.findOne({ userId: req.userId! }).lean();
  if (!profile || !profile.isProfileComplete) {
    return res
      .status(403)
      .json({ error: "Complete your profile before creating groups" });
  }
  const { name, description, schedule } = req.body || {};
  if (!name || !description || !schedule)
    return res
      .status(400)
      .json({ error: "name, description, schedule required" });
  const created = await SupportGroupModel.create({
    name,
    description,
    schedule,
    createdBy: req.userId!,
    members: [],
  });
  res.status(201).json(created);
});

router.post("/:groupId/toggle", requireAuth, async (req: AuthRequest, res) => {
  // Ensure profile is complete before joining/leaving groups
  const profile = await ProfileModel.findOne({ userId: req.userId! }).lean();
  if (!profile || !profile.isProfileComplete) {
    return res
      .status(403)
      .json({ error: "Complete your profile before joining groups" });
  }
  const { groupId } = req.params;
  const group = await SupportGroupModel.findById(groupId);
  if (!group) return res.status(404).json({ error: "group not found" });
  const idx = group.members.indexOf(req.userId!);
  if (idx >= 0) group.members.splice(idx, 1);
  else group.members.push(req.userId!);
  await group.save();
  res.json({ ok: true, members: group.members });
});

export default router;

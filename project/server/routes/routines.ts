import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { RoutineModel } from '../models/Routine';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const items = await RoutineModel.find({ userId: req.userId! }).sort({ date: 1, time: 1 }).lean();
  res.json(items);
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, description, date, time, category } = req.body || {};
  if (!title || !date || !time) return res.status(400).json({ error: 'title, date, time required' });
  const created = await RoutineModel.create({ userId: req.userId!, title, description, date, time, category });
  res.status(201).json(created);
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  await RoutineModel.deleteOne({ _id: id, userId: req.userId! });
  res.status(204).end();
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, description, date, time, category } = req.body || {};
  const updated = await RoutineModel.findOneAndUpdate(
    { _id: id, userId: req.userId! },
    { $set: { title, description, date, time, category } },
    { new: true }
  ).lean();
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

export default router;







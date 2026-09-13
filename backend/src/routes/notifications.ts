import { Router, Response } from 'express';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/index';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.get('/', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: notifications });
}));

router.patch('/read-all', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ user: req.user!._id, read: false }, { read: true });
  res.json({ success: true });
}));

router.patch('/:id/read', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user!._id }, { read: true });
  res.json({ success: true });
}));

router.delete('/:id', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
  res.json({ success: true });
}));

export default router;

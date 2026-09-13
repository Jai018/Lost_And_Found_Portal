import { Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Item } from '../models/Item';

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const allowed = ['name', 'bio', 'location', 'avatar', 'notificationPrefs'];
  const updates: Record<string, any> = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user });
});

export const getMyItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, limit = 20, page = 1, type, status } = req.query as Record<string, string>;
  const targetId = userId || req.user!._id;
  const filter: Record<string, any> = { reportedBy: targetId };
  if (type)   filter.type   = type;
  if (status) filter.status = status;

  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));

  const [items, total] = await Promise.all([
    Item.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Item.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total } });
});

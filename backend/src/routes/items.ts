import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth';
import {
  getItems, getItemById, updateItem, deleteItem,
  incrementView, getRelated, submitFinderTip, resolveItem
} from '../controllers/items.controller';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/error';
import type { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Public board — show only admin-approved items
router.get('/',              optionalAuth, getItems);
router.get('/:id',           optionalAuth, getItemById);
router.post('/:id/view',     optionalAuth, incrementView);
router.get('/:id/related',   optionalAuth, getRelated);

// Member actions — must be logged in
router.post('/:id/tip',      protect,      submitFinderTip);   // "I found this"
router.patch('/:id/resolve', protect,      resolveItem);       // "I found my item / resolved"
router.put('/:id',           protect,      updateItem);
router.delete('/:id',        protect,      deleteItem);

// ── Bookmark toggle ───────────────────────────────────────────────────────
router.post('/:id/bookmark', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const itemId = req.params.id as string;
  const user   = await User.findById(req.user!._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const isBookmarked = user.bookmarks.includes(String(itemId));

  if (isBookmarked) {
    await User.findByIdAndUpdate(req.user!._id, { $pull: { bookmarks: itemId } });
  } else {
    await User.findByIdAndUpdate(req.user!._id, { $addToSet: { bookmarks: itemId } });
  }

  res.json({ success: true, data: { bookmarked: !isBookmarked } });
}));

export default router;


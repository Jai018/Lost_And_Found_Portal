import { Response } from 'express';
import { Item } from '../models/Item';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

// ── Get All Items (Board) ─────────────────────────────────────────────────
// Only returns admin-approved (status: 'active') items for the org
export const getItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    type, category, search, sortBy = 'newest',
    page = 1, limit = 12,
  } = req.query as Record<string, string>;

  // Only show active (admin-approved) items
  const filter: Record<string, any> = { status: 'active' };
  if (type)     filter.type     = type;
  if (category) filter.category = category;

  if (search) {
    filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap: Record<string, object> = {
    newest:        { createdAt: -1 },
    oldest:        { createdAt:  1 },
    'most-viewed': { views: -1 },
  };
  const sort     = sortMap[sortBy] || { createdAt: -1 };
  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort(sort as any)
      .skip(skip)
      .limit(limitNum)
      .populate('reportedBy', 'name avatar isVerified department')
      .populate('approvedBy', 'name'),
    Item.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// ── Get Item By ID ────────────────────────────────────────────────────────
export const getItemById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.id)
    .populate('reportedBy', 'name avatar isVerified stats department')
    .populate('approvedBy', 'name avatar');

  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found.' });
  }

  // Only show active items to regular users (admin can see all)
  if (item.status !== 'active' && req.user?.role === 'user') {
    return res.status(403).json({ success: false, message: 'This item is not publicly visible yet.' });
  }

  res.json({ success: true, data: item });
});

// ── Increment View ────────────────────────────────────────────────────────
export const incrementView = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json({ success: true });
});

// ── Get Related Items ─────────────────────────────────────────────────────
export const getRelated = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.json({ success: true, data: [] });

  const related = await Item.find({
    _id:      { $ne: item._id },
    status:   'active',
    category: item.category,
  })
    .limit(4)
    .populate('reportedBy', 'name avatar isVerified');

  res.json({ success: true, data: related });
});

// ── Submit Finder Tip ─────────────────────────────────────────────────────
// Member says "I found/spotted this item" — goes to admin for verification
export const submitFinderTip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message, tip, contact } = req.body;
  const tipMessage = message || tip;

  if (!tipMessage) {
    return res.status(400).json({ success: false, message: 'Please provide a message for the admin.' });
  }

  const item = await Item.findById(req.params.id);
  if (!item || item.status !== 'active') {
    return res.status(404).json({ success: false, message: 'Item not found.' });
  }

  // Don't allow the original reporter to submit a tip on their own item
  if (item.reportedBy.toString() === req.user!._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot submit a tip on your own report.' });
  }

  // Check if user already submitted a tip
  const alreadyTipped = item.finderTips.some(
    (t) => t.submittedBy.toString() === req.user!._id.toString()
  );
  if (alreadyTipped) {
    return res.status(400).json({ success: false, message: 'You have already submitted a tip for this item.' });
  }

  item.finderTips.push({
    submittedBy: req.user!._id as any,
    message: tipMessage,
    contact,
    status: 'new',
    createdAt: new Date(),
  });
  await item.save();

  // Update user stats
  await User.findByIdAndUpdate(req.user!._id, { $inc: { 'stats.itemsFound': 1 } });

  res.status(201).json({ success: true, message: 'Your tip has been sent to the admin. They will contact you shortly to verify and arrange the return.' });
});

// ── Update Item (admin/owner only) ────────────────────────────────────────
export const updateItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  if (item.reportedBy.toString() !== req.user!._id.toString() && req.user!.role === 'user') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: updated });
});

// ── Delete Item (admin/owner only) ────────────────────────────────────────
export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  if (item.reportedBy.toString() !== req.user!._id.toString() && req.user!.role === 'user') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Item deleted.' });
});

// ── Resolve Item (owner or admin) ─────────────────────────────────────────
export const resolveItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  if (item.reportedBy.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to resolve this item.' });
  }

  item.status = 'resolved';
  await item.save();

  // Update reporter's stats
  await User.findByIdAndUpdate(item.reportedBy, { $inc: { 'stats.successfulReturns': 1 } });

  res.json({ success: true, message: 'Item marked as found and resolved! 🎉', data: item });
});

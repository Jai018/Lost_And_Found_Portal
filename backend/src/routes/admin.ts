import { Router, Response } from 'express';
import { protect, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Item } from '../models/Item';
import { OrgReport } from '../models/index';
import { asyncHandler } from '../middleware/error';

const router = Router();
router.use(protect);
router.use(requireRole('admin', 'moderator'));

// ── Dashboard Stats ───────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalItems, resolvedItems, pendingReports, activeItems] = await Promise.all([
    User.countDocuments(),
    Item.countDocuments(),
    Item.countDocuments({ status: 'resolved' }),
    OrgReport.countDocuments({ status: 'pending' }),
    Item.countDocuments({ status: 'active' }),
  ]);

  // Monthly data for charts (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const [reports, resolved] = await Promise.all([
      OrgReport.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      Item.countDocuments({ status: 'resolved', updatedAt: { $gte: start, $lt: end } }),
    ]);
    months.push({
      month: d.toLocaleDateString('en', { month: 'short' }),
      reports,
      resolved,
    });
  }

  // Category breakdown
  const catBreakdown = await Item.aggregate([
    { $match: { status: { $in: ['active', 'resolved'] } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { category: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  res.json({
    success: true,
    data: { totalUsers, totalItems, resolvedItems, pendingReports, activeItems, monthlyStats: months, categoryBreakdown: catBreakdown },
  });
}));

// ── Report Queue: List all pending user reports ───────────────────────────
router.get('/reports', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query as Record<string, string>;
  const pageNum  = Number(page);
  const limitNum = Number(limit);

  const [reports, total] = await Promise.all([
    OrgReport.find({ status: status as any })
      .populate('reportedBy', 'name email avatar department studentId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    OrgReport.countDocuments({ status: status as any }),
  ]);

  res.json({ success: true, data: reports, pagination: { page: pageNum, total } });
}));

// ── Publish a report as a public board item ───────────────────────────────
router.patch('/reports/:id/publish', asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await OrgReport.findById(req.params.id).populate('reportedBy', 'name orgCode');
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
  if (report.status === 'published') {
    return res.status(400).json({ success: false, message: 'Already published.' });
  }

  const reporter = report.reportedBy as any;

  // Create the public Item from the report
  const item = await Item.create({
    type:        (report as any).type || 'lost',
    title:       report.title,
    description: report.description,
    category:    report.category,
    images:      report.images,
    status:      'active',
    orgCode:     report.orgCode,
    location: {
      address:  report.locationDetails,
      building: report.locationDetails,
    },
    date:         report.dateOccurred,
    reportedBy:   reporter._id,
    approvedBy:   req.user!._id,
    approvedAt:   new Date(),
    linkedReport: report._id,
    tags:         [report.category.toLowerCase()],
  });

  // Update report status
  report.status        = 'published';
  report.publishedItem = item._id as any;
  report.adminNote     = req.body.adminNote || '';
  await report.save();

  res.json({ success: true, data: { report, item }, message: 'Report published to the board successfully.' });
}));

// ── Reject a report ───────────────────────────────────────────────────────
router.patch('/reports/:id/reject', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const report = await OrgReport.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', adminNote: reason || 'Does not meet guidelines.' },
    { new: true }
  );
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
  res.json({ success: true, data: report });
}));

// ── List tips for an item ─────────────────────────────────────────────────
router.get('/items/:id/tips', asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.id)
    .populate('finderTips.submittedBy', 'name email avatar department');
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  res.json({ success: true, data: item.finderTips });
}));

// ── Mark a tip as reviewed / verified ────────────────────────────────────
router.patch('/items/:id/tips/:tipId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body; // 'reviewed' | 'verified'
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  const tip = item.finderTips.find((t: any) => t._id?.toString() === req.params.tipId) as any;
  if (!tip) return res.status(404).json({ success: false, message: 'Tip not found.' });

  tip.status = status as 'new' | 'reviewed' | 'verified';
  await item.save();

  res.json({ success: true, data: tip });
}));

// ── Resolve/close an item (returned to owner) ─────────────────────────────
router.patch('/items/:id/resolve', asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved' },
    { new: true }
  );
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

  // Update reporter's stats
  await User.findByIdAndUpdate(item.reportedBy, { $inc: { 'stats.successfulReturns': 1 } });

  res.json({ success: true, data: item, message: 'Item marked as returned.' });
}));

// ── List all active board items with tip counts ───────────────────────────
router.get('/items', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status = 'active', page = 1, limit = 20 } = req.query as Record<string, string>;
  const pageNum  = Number(page);
  const limitNum = Number(limit);

  const [items, total] = await Promise.all([
    Item.find({ status: status as any })
      .populate('reportedBy', 'name avatar department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Item.countDocuments({ status: status as any }),
  ]);

  res.json({ success: true, data: items, pagination: { page: pageNum, total } });
}));

// ── List / manage users ───────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search = '' } = req.query as Record<string, string>;
  const filter: Record<string, any> = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const pageNum = Number(page), limitNum = Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: { page: pageNum, total } });
}));

// ── Ban user ─────────────────────────────────────────────────────────────
router.patch('/users/:id/ban', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, data: user });
}));

// ── Unban user ────────────────────────────────────────────────────────────
router.patch('/users/:id/unban', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, data: user });
}));

export default router;

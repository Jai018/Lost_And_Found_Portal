import { Router, Response } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { Item } from '../models/Item';
import { User } from '../models/User';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All report routes require authentication
router.use(protect);

// ── POST /api/reports ─────────────────────────────────────────────────────
// Member submits a lost-item report → immediately visible on the board
router.post(
  '/',
  upload.array('images', 5),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, category, locationDetails, dateOccurred } = req.body;

    if (!title || !description || !category || !locationDetails || !dateOccurred) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    // Convert uploaded images to base64 data URIs for storage
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files as Express.Multer.File[]) {
        images.push(`data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
      }
    }

    // Create item directly as 'active' so it appears on the public board immediately
    const item = await Item.create({
      type:        'lost' as const,
      title,
      description,
      category,
      images,
      status:      'active' as const,   // immediately visible to all users
      orgCode:     req.user!.orgCode || 'default',
      location: {
        address:     locationDetails,
        building:    locationDetails,
        coordinates: [0, 0],
      },
      date:       new Date(dateOccurred),
      tags:       [category.toLowerCase()],
      reportedBy: req.user!._id,
      approvedBy: req.user!._id,
      approvedAt: new Date(),
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user!._id, { $inc: { 'stats.itemsReported': 1 } });

    res.status(201).json({
      success: true,
      data: { _id: item._id, title: item.title, status: item.status },
      message: 'Your report has been posted to the board successfully!',
    });
  })
);

// ── GET /api/reports/mine ─────────────────────────────────────────────────
// Member views their own submitted items
router.get(
  '/mine',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const items = await Item
      .find({ reportedBy: req.user!._id })
      .sort({ createdAt: -1 })
      .select('title description category status images location date createdAt');

    res.json({ success: true, data: items });
  })
);

export default router;

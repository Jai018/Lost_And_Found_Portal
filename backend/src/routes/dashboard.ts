import { Router, Response } from 'express';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Item } from '../models/Item';
import { OrgReport } from '../models/index';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.get('/', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const uid = req.user!._id;

  const [totalReports, pendingReports, publishedReports, resolvedItems] = await Promise.all([
    OrgReport.countDocuments({ reportedBy: uid }),
    OrgReport.countDocuments({ reportedBy: uid, status: 'pending' }),
    OrgReport.countDocuments({ reportedBy: uid, status: 'published' }),
    Item.countDocuments({ reportedBy: uid, status: 'resolved' }),
  ]);

  res.json({
    success: true,
    data: { totalReports, pendingReports, publishedReports, resolvedItems },
  });
}));

export default router;

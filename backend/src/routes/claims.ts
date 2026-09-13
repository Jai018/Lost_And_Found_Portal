import { Router } from 'express';
import { protect } from '../middleware/auth';
import { submitClaim, getClaims, updateClaim } from '../controllers/claims.controller';

const router = Router();

// All claim endpoints return 410 Gone — workflow replaced by OrgReport system
router.post('/items/:itemId/claims',    protect, submitClaim);
router.get('/items/:itemId/claims',     protect, getClaims);
router.patch('/claims/:claimId/status', protect, updateClaim);

export default router;

import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getMe, getUserById, updateMe, getMyItems } from '../controllers/users.controller';

const router = Router();

router.get('/me',           protect, getMe);
router.get('/me/items',     protect, getMyItems);
router.put('/me',           protect, updateMe);
router.get('/:id',          getUserById);
router.get('/:id/items',    getMyItems);

export default router;

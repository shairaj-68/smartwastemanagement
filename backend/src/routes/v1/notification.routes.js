import { Router } from 'express';
import { listNotifications, markRead, markAllRead } from '../../controllers/notification.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, asyncHandler(listNotifications));
router.patch('/read-all', verifyToken, asyncHandler(markAllRead));
router.patch('/:id/read', verifyToken, asyncHandler(markRead));

export default router;

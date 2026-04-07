import { Router } from 'express';
import { listNotifications } from '../../controllers/notification.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, asyncHandler(listNotifications));

export default router;

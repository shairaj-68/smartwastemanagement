import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import complaintRoutes from './complaint.routes.js';
import workerRoutes from './worker.routes.js';
import adminRoutes from './admin.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/workers', workerRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;

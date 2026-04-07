import { Router } from 'express';
import { assignWorker, deleteComplaint, manageUsers, viewAnalytics } from '../../controllers/admin.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { authorizeRole } from '../../middleware/role.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { assignWorkerSchema } from '../../validators/admin.validator.js';

const router = Router();

router.use(verifyToken, authorizeRole('admin'));

router.post('/assign-worker', validate(assignWorkerSchema), asyncHandler(assignWorker));
router.get('/users', asyncHandler(manageUsers));
router.get('/analytics', asyncHandler(viewAnalytics));
router.delete('/complaints/:id', asyncHandler(deleteComplaint));

export default router;

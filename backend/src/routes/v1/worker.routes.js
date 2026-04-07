import { Router } from 'express';
import { updateCollectionStatus, viewAssignedComplaints } from '../../controllers/worker.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { authorizeRole } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateComplaintStatusSchema } from '../../validators/complaint.validator.js';

const router = Router();

router.get('/assigned-complaints', verifyToken, authorizeRole('worker', 'admin'), asyncHandler(viewAssignedComplaints));
router.patch('/complaints/:id/status', verifyToken, authorizeRole('worker', 'admin'), validate(updateComplaintStatusSchema), asyncHandler(updateCollectionStatus));

export default router;

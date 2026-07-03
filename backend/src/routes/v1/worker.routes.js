import { Router } from 'express';
import { updateCollectionStatus, viewAssignedComplaints, viewAssignedBins, updateBinStatus } from '../../controllers/worker.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { authorizeRole } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateComplaintStatusSchema } from '../../validators/complaint.validator.js';
import { updateBinStatusSchema } from '../../validators/bin.validator.js';

const router = Router();

router.get('/assigned-complaints', verifyToken, authorizeRole('worker', 'admin'), asyncHandler(viewAssignedComplaints));
router.patch('/complaints/:id/status', verifyToken, authorizeRole('worker', 'admin'), validate(updateComplaintStatusSchema), asyncHandler(updateCollectionStatus));

router.get('/assigned-bins', verifyToken, authorizeRole('worker', 'admin'), asyncHandler(viewAssignedBins));
router.patch('/bins/:id/status', verifyToken, authorizeRole('worker', 'admin'), validate(updateBinStatusSchema), asyncHandler(updateBinStatus));

export default router;

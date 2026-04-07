import { Router } from 'express';
import {
	getComplaintById,
	listComplaints,
	listNearbyComplaints,
	submitComplaint,
	updateComplaintStatus,
	uploadComplaintImage,
} from '../../controllers/complaint.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { authorizeRole } from '../../middleware/role.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import {
	createComplaintSchema,
	nearbyQuerySchema,
	updateComplaintStatusSchema,
} from '../../validators/complaint.validator.js';

const router = Router();

router.post('/', verifyToken, authorizeRole('citizen', 'admin'), validate(createComplaintSchema), asyncHandler(submitComplaint));
router.get('/', verifyToken, asyncHandler(listComplaints));
router.get('/nearby/search', verifyToken, validate(nearbyQuerySchema, 'query'), asyncHandler(listNearbyComplaints));
router.get('/:id', verifyToken, asyncHandler(getComplaintById));
router.patch('/:id/status', verifyToken, authorizeRole('worker', 'admin'), validate(updateComplaintStatusSchema), asyncHandler(updateComplaintStatus));
router.post('/:id/image', verifyToken, upload.single('image'), asyncHandler(uploadComplaintImage));

export default router;

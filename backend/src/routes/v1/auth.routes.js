import { Router } from 'express';
import {
	getCurrentUser,
	loginUser,
	logoutUser,
	refreshSession,
	registerUser,
} from '../../controllers/auth.controller.js';
import { asyncHandler } from '../../middleware/async.middleware.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginSchema, refreshSchema, registerSchema } from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(registerUser));
router.post('/login', validate(loginSchema), asyncHandler(loginUser));
router.post('/refresh', validate(refreshSchema), asyncHandler(refreshSession));
router.post('/logout', verifyToken, asyncHandler(logoutUser));
router.get('/me', verifyToken, asyncHandler(getCurrentUser));

export default router;

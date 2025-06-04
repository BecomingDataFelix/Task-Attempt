import { Router } from 'express';
import { loginUser, verifyEmail } from '../controllers/authController';

const router = Router();

router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);

export default router;
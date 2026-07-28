import { Router } from 'express';
import { apply, sendOTP, verifyOTP, submitIdCard } from './controller';

const router = Router();

router.post('/apply', apply);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/submit-id', submitIdCard);

export default router;
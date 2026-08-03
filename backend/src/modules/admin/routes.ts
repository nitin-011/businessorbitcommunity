import { Router } from 'express';
import { getStats, getStudents, getBusiness, approve, reject, sendBulk } from './controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

router.get('/stats', getStats);
router.get('/students', getStudents);
router.get('/business', getBusiness);
router.patch('/approve/:type/:id', approve);
router.patch('/reject/:type/:id', reject);
router.post('/bulk-email', sendBulk);

export default router;
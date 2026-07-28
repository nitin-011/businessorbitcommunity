import { Router } from 'express';
import { apply } from './controller';

const router = Router();

router.post('/apply', apply);

export default router;
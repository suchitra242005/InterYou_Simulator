// @ts-nocheck
import { Router } from 'express';
import { dashboardController } from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/stats', (req, res) => dashboardController.getStats(req, res));

export default router;

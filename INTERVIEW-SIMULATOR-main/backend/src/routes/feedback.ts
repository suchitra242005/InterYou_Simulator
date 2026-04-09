// @ts-nocheck
import { Router } from 'express';
import { feedbackController } from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => feedbackController.list(req, res));
router.post('/interview/:interviewId/generate', (req, res) => feedbackController.generate(req, res));
router.get('/interview/:interviewId', (req, res) => feedbackController.get(req, res));
router.get('/:id/report', (req, res) => feedbackController.getReport(req, res));

export default router;

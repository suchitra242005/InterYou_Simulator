import { Router } from 'express';
import authRoutes from './auth.js';
import resumeRoutes from './resume.js';
import interviewRoutes from './interview.js';
import feedbackRoutes from './feedback.js';
import dashboardRoutes from './dashboard.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

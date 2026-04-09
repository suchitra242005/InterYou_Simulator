// @ts-nocheck
import { Router } from 'express';
import { interviewController, createInterviewSchema, submitAnswerSchema } from '../controllers/index.js';
import { validate } from '../middleware/index.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createInterviewSchema), (req, res) => interviewController.create(req, res));
router.get('/', (req, res) => interviewController.list(req, res));
router.get('/:id', (req, res) => interviewController.get(req, res));
router.post('/:id/questions', (req, res) => interviewController.generateQuestions(req, res));
router.post('/:id/start', (req, res) => interviewController.start(req, res));
router.post('/:id/answer', validate(submitAnswerSchema), (req, res) => interviewController.submitAnswer(req, res));
router.post('/:id/complete', (req, res) => interviewController.complete(req, res));
router.get('/:id/next-question', (req, res) => interviewController.getNextQuestion(req, res));
router.post('/:id/adaptive-question', (req, res) => interviewController.getAdaptiveQuestion(req, res));
router.post('/:id/evaluate-code', (req, res) => interviewController.evaluateCode(req, res));
router.get('/:id/introduction', (req, res) => interviewController.getIntroduction(req, res));
router.post('/:id/feedback', (req, res) => interviewController.getFeedback(req, res));
router.post('/:id/evaluate-code-ai', (req, res) => interviewController.evaluateCodeAI(req, res));
router.post('/:id/regenerate-questions', (req, res) => interviewController.regenerateQuestions(req, res));

export default router;

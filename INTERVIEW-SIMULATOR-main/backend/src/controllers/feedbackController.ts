import { Response } from 'express';
import { feedbackService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';

export class FeedbackController {
  async generate(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const interviewId = req.params.interviewId as string;
    const feedback = await feedbackService.generateFeedback(interviewId, req.userId);
    res.json(feedback);
  }

  async get(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const interviewId = req.params.interviewId as string;
    const feedback = await feedbackService.getFeedback(interviewId, req.userId);
    res.json(feedback);
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const feedbacks = await feedbackService.getUserFeedbacks(req.userId);
    res.json(feedbacks);
  }

  async getReport(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const pdfBuffer = await feedbackService.generateFeedbackReport(id, req.userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=interview-feedback.pdf');
    res.send(pdfBuffer);
  }
}

export const feedbackController = new FeedbackController();

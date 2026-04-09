import { Response } from 'express';
import { z } from 'zod';
import { interviewService, aiInterviewService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';

export const createInterviewSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  interviewType: z.enum(['technical', 'behavioral', 'mixed']).default('mixed'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionCount: z.number().min(1).max(20).default(5),
});

export const evaluateCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.enum(['javascript', 'python', 'java', 'cpp', 'csharp']).default('javascript'),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
  })).optional(),
});

export const submitAnswerSchema = z.object({
  questionIndex: z.number().min(0),
  text: z.string().min(1, 'Answer text is required'),
  speechAnalysis: z.object({
    confidence: z.number().min(0).max(100),
    clarity: z.number().min(0).max(100),
    fillerWordCount: z.number().min(0),
    speakingSpeed: z.number(),
    correctness: z.number().min(0).max(100),
  }).optional(),
  facialAnalysis: z.object({
    eyeContact: z.number().min(0).max(100),
    expressions: z.record(z.string(), z.number()),
    attentiveness: z.number().min(0).max(100),
  }).optional(),
});

export class InterviewController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const options = req.body;
    const interview = await interviewService.createInterview(req.userId, options.resumeId, options);
    res.status(201).json(interview);
  }

  async generateQuestions(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const questions = await interviewService.generateQuestions(id, req.userId);
    res.json(questions);
  }

  async start(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const { cameraVerified } = req.body;
    const interview = await interviewService.startInterview(id, req.userId, cameraVerified);
    res.json(interview);
  }

  async submitAnswer(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const answer = req.body;
    const interview = await interviewService.submitAnswer(id, req.userId, answer);
    res.json(interview);
  }

  async complete(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const interview = await interviewService.completeInterview(id, req.userId);
    res.json(interview);
  }

  async get(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const interview = await interviewService.getInterview(id, req.userId);
    res.json(interview);
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const status = req.query.status as string | undefined;
    const interviews = await interviewService.getUserInterviews(req.userId, status);
    res.json(interviews);
  }

  async getNextQuestion(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const question = await interviewService.getNextQuestion(id, req.userId);
    res.json(question);
  }

  async getAdaptiveQuestion(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const { previousAnswer } = req.body;
    const question = await interviewService.getAdaptiveQuestion(id, req.userId, previousAnswer);
    res.json(question);
  }

  async evaluateCode(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { code, language, testCases } = req.body;
    const result = await interviewService.evaluateCode(code, language, testCases);
    res.json(result);
  }

  async getIntroduction(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const introduction = await interviewService.getAIIntroduction(id, req.userId);
    res.json({ introduction });
  }

  async getFeedback(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const { questionIndex, answer, speechAnalysis, facialAnalysis } = req.body;
    const feedback = await interviewService.getAIFeedback(id, req.userId, questionIndex, answer, speechAnalysis, facialAnalysis);
    res.json(feedback);
  }

  async evaluateCodeAI(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const { code, language, questionIndex } = req.body;
    const result = await interviewService.evaluateCodeWithAI(id, req.userId, code, language, questionIndex);
    res.json(result);
  }

  async regenerateQuestions(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const questions = await interviewService.regenerateQuestions(id, req.userId);
    res.json(questions);
  }
}

export const interviewController = new InterviewController();

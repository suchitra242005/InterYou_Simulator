import { Response } from 'express';
import { z } from 'zod';
import { resumeService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';

export const updateResumeSchema = z.object({
  skills: z.array(z.string()).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })).optional(),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    year: z.string(),
  })).optional(),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string(),
    description: z.string(),
  })).optional(),
  summary: z.string().optional(),
});

export class ResumeController {
  async upload(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const resume = await resumeService.uploadResume(req.userId, req.file);
    res.status(201).json(resume);
  }

  async parse(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const resume = await resumeService.parseResume(id, req.userId);
    res.json(resume);
  }

  async get(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const resume = await resumeService.getResume(id, req.userId);
    res.json(resume);
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const resumes = await resumeService.getUserResumes(req.userId);
    res.json(resumes);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const updates = req.body;
    const resume = await resumeService.updateResume(id, req.userId, updates);
    res.json(resume);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    await resumeService.deleteResume(id, req.userId);
    res.json({ message: 'Resume deleted successfully' });
  }

  async getReport(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = req.params.id as string;
    const pdfBuffer = await resumeService.generateReport(id, req.userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume-report.pdf');
    res.send(pdfBuffer);
  }
}

export const resumeController = new ResumeController();

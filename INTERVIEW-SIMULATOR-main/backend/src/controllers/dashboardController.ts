import { Response } from 'express';
import { dashboardService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const stats = await dashboardService.getStats(req.userId);
    res.json(stats);
  }
}

export const dashboardController = new DashboardController();

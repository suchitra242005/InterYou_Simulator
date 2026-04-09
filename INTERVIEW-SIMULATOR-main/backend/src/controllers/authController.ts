import { Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    const { email, password, name } = req.body;
    const { user, tokens } = await authService.register(email, password, name);
    res.status(201).json({ user, ...tokens });
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);
    res.json({ user, ...tokens });
  }

  async refresh(req: AuthRequest, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    if (req.userId) {
      await authService.logout(req.userId);
    }
    res.json({ message: 'Logged out successfully' });
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    res.json({ user: req.user });
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { name, avatar } = req.body;
    const user = await authService.updateProfile(req.userId, { name, avatar });
    res.json({ user });
  }

  async forgotPassword(req: AuthRequest, res: Response): Promise<void> {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  }

  async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successful. Please login with your new password.' });
  }
}

export const authController = new AuthController();

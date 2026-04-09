// @ts-nocheck
import { Router } from 'express';
import passport from 'passport';
import { authController, registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from '../controllers/index.js';
import { validate } from '../middleware/index.js';
import { authenticate } from '../middleware/index.js';
import { config } from '../config/index.js';

const router = Router();

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.post('/refresh', validate(refreshSchema), (req, res) => authController.refresh(req, res));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));
router.patch('/profile', authenticate, (req, res) => authController.updateProfile(req, res));
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', validate(resetPasswordSchema), (req, res) => authController.resetPassword(req, res));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const user = req.user as any;
  const authService = require('../services/auth.js').authService;
  const tokens = authService.generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  user.save();
  res.redirect(`${config.frontendUrl}?oauth=google&accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  const user = req.user as any;
  console.log("GitHub callback user:", user);
  const authService = require('../services/auth.js').authService;
  const tokens = authService.generateTokens(user);
  res.redirect(`${config.frontendUrl}?oauth=github&accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
});

export default router;

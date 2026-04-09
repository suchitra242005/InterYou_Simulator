import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, IUser } from '../models/index.js';
import { AppError } from '../middleware/index.js';
import { emailService, generateResetToken } from './email.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  userId: string;
  version: number;
}

export class AuthService {
  generateTokens(user: IUser): TokenPair {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      version: user.refreshTokenVersion,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  }

  async register(email: string, password: string, name: string): Promise<{ user: IUser; tokens: TokenPair }> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
    });

    await user.save();

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  }

  async login(email: string, password: string): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.userId);

      if (!user) {
        throw new AppError('User not found', 401);
      }

      if (user.refreshTokenVersion !== payload.version) {
        throw new AppError('Token has been invalidated', 401);
      }

      const tokens = this.generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $inc: { refreshTokenVersion: 1 },
      $unset: { refreshToken: 1 },
    });
  }

  async updateProfile(userId: string, updates: { name?: string; avatar?: string }): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return;
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    try {
      await emailService.sendResetPasswordEmail(user.email, resetToken);
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      throw new AppError('Failed to send reset email', 500);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<IUser> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await emailService.sendPasswordChangedEmail(user.email);

    return user;
  }

  async oauthLogin(user: IUser): Promise<{ user: IUser; tokens: TokenPair }> {
    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  }
}

export const authService = new AuthService();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidTokenError,
} from '../domain/errors';
import { generateCardNumber } from '../domain/rewards';
import { isValidRegistrationInput } from '../domain/validation';
import type { UserRepository } from '../infrastructure/repositories';
import type { LoyaltyCardRepository } from '../infrastructure/repositories';
import { logInfo, logWarn } from '../logger/logger';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly cardRepo: LoyaltyCardRepository,
  ) {}

  async register(input: RegisterInput) {
    const { name, email, password } = input;

    if (!isValidRegistrationInput(name, email, password)) {
      throw new Error('Invalid registration data');
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await this.userRepo.create(name, email, hash);
      const cardNumber = generateCardNumber();
      await this.cardRepo.create(user.id, cardNumber);

      logInfo('user_registered', { userId: user.id });

      return { user };
    } catch (err) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '23505') {
        throw new DuplicateEmailError();
      }
      throw err;
    }
  }

  async login(input: LoginInput): Promise<{ token: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user?.password_hash) {
      logWarn('login_failed', { reason: 'user_not_found' });
      throw new InvalidCredentialsError();
    }

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      logWarn('login_failed', { reason: 'invalid_password', userId: user.id });
      throw new InvalidCredentialsError();
    }

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn, algorithm: 'HS256' } as jwt.SignOptions,
    );

    logInfo('login_success', { userId: user.id });

    return { token };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    return user;
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return { message: 'Si el email existe, se generó un token de recuperación' };
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepo.setResetToken(user.id, token, expires);

    logInfo('password_reset_requested', { userId: user.id });

    return {
      message: 'Token de recuperación generado',
      resetToken: token,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) {
      throw new InvalidTokenError();
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updatePassword(user.id, hash);

    logInfo('password_reset_completed', { userId: user.id });

    return { message: 'Contraseña actualizada correctamente' };
  }
}

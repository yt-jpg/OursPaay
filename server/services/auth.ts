import crypto from "crypto";
import speakeasy from "speakeasy";

export class AuthService {
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                   '-' + 
                   Math.random().toString(36).substring(2, 6).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  generateContractHash(data: {
    userId: string;
    contractType: string;
    contractVersion: string;
    timestamp: number;
  }): string {
    const payload = JSON.stringify(data);
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  validateTOTP(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 12);
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hash);
  }

  generateJWT(payload: any, expiresIn: string = '7d'): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn,
    });
  }

  verifyJWT(token: string): any {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  }
}

export const authService = new AuthService();

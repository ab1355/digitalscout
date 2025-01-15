import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { User } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateToken(user: User): { accessToken: string; refreshToken: string } {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const refreshToken = sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): TokenPayload {
  try {
    return verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function extractTokenFromHeader(header: string | undefined): string {
  if (!header || !header.startsWith('Bearer ')) {
    throw new Error('No bearer token found');
  }
  return header.split(' ')[1];
}

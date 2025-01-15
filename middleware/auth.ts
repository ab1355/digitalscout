import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokenFromHeader, verifyToken } from '../lib/auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

type NextApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>;

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      const payload = verifyToken(token);
      
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export function withRole(handler: NextApiHandler, allowedRoles: string[]) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return handler(req, res);
  });
}

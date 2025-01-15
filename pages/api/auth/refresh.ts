import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { verifyToken, generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generate new tokens
    const tokens = generateToken(user);

    return res.status(200).json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { verifyPassword, generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user);

    // Return user data and tokens
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import prisma from '../../../lib/prisma';
import type { AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user!.id;

    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            badges: true,
          },
        },
        progress: {
          where: {
            status: 'completed',
          },
          include: {
            challenge: {
              select: {
                points: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total points from completed challenges
    const totalPoints = user.progress.reduce(
      (sum, progress) => sum + (progress.challenge?.points || 0),
      0
    );

    const stats = {
      totalPoints,
      completedChallenges: user.progress.length,
      earnedBadges: user._count.badges,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Failed to fetch user stats' });
  }
}

export default withAuth(handler);

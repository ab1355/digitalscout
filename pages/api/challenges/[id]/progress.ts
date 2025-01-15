import { NextApiResponse } from 'next';
import { withAuth } from '../../../../middleware/auth';
import prisma from '../../../../lib/prisma';
import type { AuthenticatedRequest } from '../../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id: challengeId } = req.query;
  const userId = req.user!.id;

  if (typeof challengeId !== 'string') {
    return res.status(400).json({ error: 'Invalid challenge ID' });
  }

  if (req.method === 'POST') {
    try {
      // Start or update challenge progress
      const { status, currentStep, completedSteps } = req.body;

      const progress = await prisma.$transaction(async (prisma) => {
        // Get or create progress
        let progress = await prisma.challengeProgress.upsert({
          where: {
            userId_challengeId: {
              userId,
              challengeId,
            },
          },
          create: {
            userId,
            challengeId,
            status: status || 'in_progress',
            currentStep: currentStep || 0,
            completedSteps: completedSteps || [],
          },
          update: {
            status,
            currentStep,
            completedSteps,
            ...(status === 'completed' ? { completedAt: new Date() } : {}),
          },
        });

        // If challenge is completed, check if badge should be awarded
        if (status === 'completed') {
          const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
            include: { badge: true },
          });

          if (challenge) {
            // Add badge to user if all challenges for this badge are completed
            const allChallengesCompleted = await prisma.challenge.count({
              where: {
                badgeId: challenge.badgeId,
                progress: {
                  some: {
                    userId,
                    status: 'completed',
                  },
                },
              },
            });

            const totalChallenges = await prisma.challenge.count({
              where: {
                badgeId: challenge.badgeId,
              },
            });

            if (allChallengesCompleted === totalChallenges) {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  badges: {
                    connect: { id: challenge.badgeId },
                  },
                },
              });
            }
          }
        }

        return progress;
      });

      return res.status(200).json(progress);
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return res.status(500).json({ error: 'Failed to update challenge progress' });
    }
  }

  if (req.method === 'GET') {
    try {
      const progress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
      });

      return res.status(200).json(progress || { status: 'not_started' });
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
      return res.status(500).json({ error: 'Failed to fetch challenge progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

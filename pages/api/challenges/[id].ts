import { NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import prisma from '../../../lib/prisma';
import type { AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid challenge ID' });
  }

  if (req.method === 'GET') {
    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id },
        include: {
          badge: true,
          steps: {
            orderBy: {
              order: 'asc'
            }
          },
          progress: {
            where: {
              userId: req.user!.id
            }
          }
        }
      });

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      return res.status(200).json(challenge);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return res.status(500).json({ error: 'Failed to fetch challenge' });
    }
  }

  if (req.method === 'PUT') {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update challenges' });
    }

    try {
      const { title, description, category, difficulty, points, badgeId, steps } = req.body;

      // Update challenge and its steps
      const challenge = await prisma.$transaction(async (prisma) => {
        // Delete existing steps
        await prisma.challengeStep.deleteMany({
          where: { challengeId: id }
        });

        // Update challenge and create new steps
        return prisma.challenge.update({
          where: { id },
          data: {
            title,
            description,
            category,
            difficulty,
            points,
            badgeId,
            steps: {
              create: steps.map((step: any, index: number) => ({
                order: index + 1,
                instructions: step.instructions,
                verificationMethod: step.verificationMethod,
                resources: step.resources || [],
              })),
            },
          },
          include: {
            steps: true,
            badge: true,
          },
        });
      });

      return res.status(200).json(challenge);
    } catch (error) {
      console.error('Error updating challenge:', error);
      return res.status(500).json({ error: 'Failed to update challenge' });
    }
  }

  if (req.method === 'DELETE') {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete challenges' });
    }

    try {
      await prisma.challenge.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      return res.status(500).json({ error: 'Failed to delete challenge' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

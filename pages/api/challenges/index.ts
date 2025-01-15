import { NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import prisma from '../../../lib/prisma';
import type { AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { category, difficulty, badgeId } = req.query;

      const where = {
        ...(category && { category: category as string }),
        ...(difficulty && { difficulty: difficulty as string }),
        ...(badgeId && { badgeId: badgeId as string }),
      };

      const challenges = await prisma.challenge.findMany({
        where,
        include: {
          badge: true,
          steps: true,
          _count: {
            select: { progress: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create challenges' });
    }

    try {
      const { title, description, category, difficulty, points, badgeId, steps } = req.body;

      const challenge = await prisma.challenge.create({
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

      return res.status(201).json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      return res.status(500).json({ error: 'Failed to create challenge' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

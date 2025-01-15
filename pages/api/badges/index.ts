import { NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import prisma from '../../../lib/prisma';
import type { AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const badges = await prisma.badge.findMany({
        include: {
          _count: {
            select: { users: true }
          }
        }
      });
      return res.status(200).json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      return res.status(500).json({ error: 'Failed to fetch badges' });
    }
  }

  if (req.method === 'POST') {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create badges' });
    }

    try {
      const { name, description, imageUrl, requirements, category, level } = req.body;

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          imageUrl,
          requirements,
          category,
          level,
        },
      });

      return res.status(201).json(badge);
    } catch (error) {
      console.error('Error creating badge:', error);
      return res.status(500).json({ error: 'Failed to create badge' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

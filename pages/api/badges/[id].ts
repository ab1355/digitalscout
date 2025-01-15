import { NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import prisma from '../../../lib/prisma';
import type { AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid badge ID' });
  }

  if (req.method === 'GET') {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id },
        include: {
          challenges: true,
          _count: {
            select: { users: true }
          }
        }
      });

      if (!badge) {
        return res.status(404).json({ error: 'Badge not found' });
      }

      return res.status(200).json(badge);
    } catch (error) {
      console.error('Error fetching badge:', error);
      return res.status(500).json({ error: 'Failed to fetch badge' });
    }
  }

  if (req.method === 'PUT') {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update badges' });
    }

    try {
      const { name, description, imageUrl, requirements, category, level } = req.body;

      const badge = await prisma.badge.update({
        where: { id },
        data: {
          name,
          description,
          imageUrl,
          requirements,
          category,
          level,
        },
      });

      return res.status(200).json(badge);
    } catch (error) {
      console.error('Error updating badge:', error);
      return res.status(500).json({ error: 'Failed to update badge' });
    }
  }

  if (req.method === 'DELETE') {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete badges' });
    }

    try {
      await prisma.badge.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting badge:', error);
      return res.status(500).json({ error: 'Failed to delete badge' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

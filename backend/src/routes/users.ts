import express from 'express';
import { optionalAuth } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();

// Get user profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            wallpapers: true,
            votes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's wallpapers
    const skip = (page - 1) * limit;
    const wallpapers = await prisma.wallpaper.findMany({
      where: { creatorId: user.id },
      include: {
        votes: req.user ? {
          where: { userId: req.user.id },
          select: { voteType: true }
        } : false,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json({
      user,
      wallpapers,
      pagination: {
        page,
        limit,
        total: user._count.wallpapers
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user's collections
router.get('/:username/collections', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const collections = await prisma.collection.findMany({
      where: {
        creatorId: user.id,
        isPublic: true
      },
      include: {
        items: {
          include: {
            wallpaper: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                voteScore: true
              }
            }
          },
          take: 3 // Preview images
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

export default router;
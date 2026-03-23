import express from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

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
    const skip = (Number(page) - 1) * Number(limit);
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
      take: Number(limit)
    });

    res.json({
      user,
      wallpapers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
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
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create collection
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        creatorId: req.user!.id,
        isPublic
      },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get collection by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (!collection.isPublic && collection.creatorId !== req.user?.id) {
      return res.status(403).json({ error: 'Collection is private' });
    }

    // Get collection items
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.collectionItem.findMany({
        where: { collectionId: id },
        include: {
          wallpaper: {
            include: {
              creator: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true
                }
              },
              votes: req.user ? {
                where: { userId: req.user.id },
                select: { voteType: true }
              } : false
            }
          }
        },
        orderBy: { addedAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.collectionItem.count({ where: { collectionId: id } })
    ]);

    res.json({
      collection,
      items: items.map(item => item.wallpaper),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Add wallpaper to collection
router.post('/:id/items', authenticateToken, async (req, res) => {
  try {
    const { id: collectionId } = req.params;
    const { wallpaperId } = req.body;

    // Verify collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { creatorId: true }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to modify this collection' });
    }

    // Check if wallpaper exists
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId },
      select: { id: true }
    });

    if (!wallpaper) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }

    // Add to collection (or ignore if already exists)
    const collectionItem = await prisma.collectionItem.upsert({
      where: {
        collectionId_wallpaperId: {
          collectionId,
          wallpaperId
        }
      },
      create: {
        collectionId,
        wallpaperId
      },
      update: {},
      include: {
        wallpaper: {
          include: {
            creator: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(collectionItem);
  } catch (error) {
    console.error('Add to collection error:', error);
    res.status(500).json({ error: 'Failed to add wallpaper to collection' });
  }
});

// Remove wallpaper from collection
router.delete('/:id/items/:wallpaperId', authenticateToken, async (req, res) => {
  try {
    const { id: collectionId, wallpaperId } = req.params;

    // Verify collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { creatorId: true }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to modify this collection' });
    }

    await prisma.collectionItem.delete({
      where: {
        collectionId_wallpaperId: {
          collectionId,
          wallpaperId
        }
      }
    });

    res.json({ message: 'Wallpaper removed from collection' });
  } catch (error) {
    console.error('Remove from collection error:', error);
    res.status(500).json({ error: 'Failed to remove wallpaper from collection' });
  }
});

// Delete collection
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this collection' });
    }

    await prisma.collection.delete({ where: { id } });

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

export default router;
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const saveGeneratedWallpaper = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, description, imageDataUrl, generationParams, tags } = req.body;

    if (!imageDataUrl || !generationParams) {
      return res.status(400).json({ error: 'Image data and generation parameters are required' });
    }

    // Validate that this is a data URL from our generator
    if (!imageDataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    // Validate generation parameters structure
    const requiredParams = ['version', 'lineNumber', 'width', 'height', 'seed', 'anchorpoints', 'jitterX', 'jitterY', 'colorspread', 'initialAmplitude'];
    const params = typeof generationParams === 'string' ? JSON.parse(generationParams) : generationParams;

    for (const param of requiredParams) {
      if (params[param] === undefined) {
        return res.status(400).json({ error: `Missing required generation parameter: ${param}` });
      }
    }

    // Convert data URL to buffer
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Process and optimize image
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);

    const processedBuffer = await sharp(imageBuffer)
      .webp({ quality: 85 })
      .toBuffer();

    await fs.writeFile(filePath, processedBuffer);

    // Get image metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Verify dimensions match generation params
    if (metadata.width !== params.width || metadata.height !== params.height) {
      return res.status(400).json({ error: 'Image dimensions do not match generation parameters' });
    }

    // Save to database
    const wallpaper = await prisma.wallpaper.create({
      data: {
        title: title || null,
        description: description || null,
        creatorId: req.user.id,
        imageUrl: `/uploads/${fileName}`,
        generationParams: params,
        width: metadata.width || 0,
        height: metadata.height || 0,
        fileSize: processedBuffer.length,
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : []
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

    res.status(201).json(wallpaper);
  } catch (error) {
    console.error('Save wallpaper error:', error);
    res.status(500).json({ error: 'Failed to save wallpaper' });
  }
};

export const getWallpapers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'recent',
      tags,
      search,
      resolution
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let orderBy: any = { createdAt: 'desc' };

    switch (sort) {
      case 'trending':
        orderBy = { voteScore: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'top-week':
        // Custom logic for trending this week
        break;
    }

    const where: any = {};

    if (tags) {
      where.tags = { hasEvery: Array.isArray(tags) ? tags : [tags] };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (resolution) {
      const [width, height] = (resolution as string).split('x').map(Number);
      where.width = width;
      where.height = height;
    }

    const [wallpapers, total] = await Promise.all([
      prisma.wallpaper.findMany({
        where,
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
          } : false,
          _count: {
            select: { comments: true }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.wallpaper.count({ where })
    ]);

    // Increment view count
    if (wallpapers.length > 0) {
      await prisma.wallpaper.updateMany({
        where: { id: { in: wallpapers.map(w => w.id) } },
        data: { viewCount: { increment: 1 } }
      });
    }

    res.json({
      data: wallpapers,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get wallpapers error:', error);
    res.status(500).json({ error: 'Failed to fetch wallpapers' });
  }
};

export const getWallpaper = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        votes: req.user ? {
          where: { userId: req.user.id },
          select: { voteType: true }
        } : false,
        comments: {
          include: {
            author: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!wallpaper) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }

    // Increment view count
    await prisma.wallpaper.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(wallpaper);
  } catch (error) {
    console.error('Get wallpaper error:', error);
    res.status(500).json({ error: 'Failed to fetch wallpaper' });
  }
};

export const deleteWallpaper = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id },
      select: { creatorId: true, imageUrl: true }
    });

    if (!wallpaper) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }

    if (wallpaper.creatorId !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized to delete this wallpaper' });
    }

    // Delete file
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(wallpaper.imageUrl));
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // Delete from database
    await prisma.wallpaper.delete({ where: { id } });

    res.json({ message: 'Wallpaper deleted successfully' });
  } catch (error) {
    console.error('Delete wallpaper error:', error);
    res.status(500).json({ error: 'Failed to delete wallpaper' });
  }
};
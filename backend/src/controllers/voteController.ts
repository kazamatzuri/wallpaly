import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

export const voteOnWallpaper = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: wallpaperId } = req.params;
    const { voteType } = req.body; // 1 for upvote, -1 for downvote, 0 to remove vote

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (![1, -1, 0].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Use 1 for upvote, -1 for downvote, 0 to remove' });
    }

    // Check if wallpaper exists
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId }
    });

    if (!wallpaper) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }

    // Check existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_wallpaperId: {
          userId: req.user.id,
          wallpaperId
        }
      }
    });

    let scoreChange = 0;
    let countChange = 0;

    if (voteType === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
        scoreChange = -existingVote.voteType;
        countChange = -1;
      }
    } else if (existingVote) {
      // Update existing vote
      if (existingVote.voteType !== voteType) {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType }
        });
        scoreChange = voteType - existingVote.voteType;
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId: req.user.id,
          wallpaperId,
          voteType
        }
      });
      scoreChange = voteType;
      countChange = 1;
    }

    // Update wallpaper vote counts
    if (scoreChange !== 0 || countChange !== 0) {
      await prisma.wallpaper.update({
        where: { id: wallpaperId },
        data: {
          voteScore: { increment: scoreChange },
          voteCount: { increment: countChange }
        }
      });
    }

    // Return updated vote counts
    const updatedWallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId },
      select: {
        id: true,
        voteScore: true,
        voteCount: true
      }
    });

    res.json({
      voteScore: updatedWallpaper?.voteScore,
      voteCount: updatedWallpaper?.voteCount,
      userVote: voteType === 0 ? null : voteType
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
};

export const getWallpaperVotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: wallpaperId } = req.params;

    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId },
      select: {
        voteScore: true,
        voteCount: true,
        votes: req.user ? {
          where: { userId: req.user.id },
          select: { voteType: true }
        } : false
      }
    });

    if (!wallpaper) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }

    res.json({
      voteScore: wallpaper.voteScore,
      voteCount: wallpaper.voteCount,
      userVote: wallpaper.votes && wallpaper.votes.length > 0 ? wallpaper.votes[0].voteType : null
    });
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
};
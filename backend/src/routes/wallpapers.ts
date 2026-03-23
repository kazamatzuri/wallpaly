import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { uploadLimiter, voteLimiter } from '../middleware/rateLimiting';
import { saveGeneratedWallpaper, getWallpapers, getWallpaper, deleteWallpaper } from '../controllers/wallpaperController';
import { voteOnWallpaper, getWallpaperVotes } from '../controllers/voteController';

const router = express.Router();

// Save generated wallpaper (no file upload, only data URL from our generator)
router.post('/', authenticateToken, uploadLimiter, saveGeneratedWallpaper);

// Get wallpapers (with optional auth for user votes)
router.get('/', optionalAuth, getWallpapers);

// Get specific wallpaper
router.get('/:id', optionalAuth, getWallpaper);

// Delete wallpaper
router.delete('/:id', authenticateToken, deleteWallpaper);

// Vote on wallpaper
router.post('/:id/vote', authenticateToken, voteLimiter, voteOnWallpaper);

// Get wallpaper votes
router.get('/:id/votes', optionalAuth, getWallpaperVotes);

export default router;
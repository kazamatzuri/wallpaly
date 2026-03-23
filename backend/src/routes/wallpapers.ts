import express from 'express';
import multer from 'multer';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { uploadLimiter, voteLimiter } from '../middleware/rateLimiting';
import { uploadWallpaper, getWallpapers, getWallpaper, deleteWallpaper } from '../controllers/wallpaperController';
import { voteOnWallpaper, getWallpaperVotes } from '../controllers/voteController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload wallpaper
router.post('/', authenticateToken, uploadLimiter, upload.single('image'), uploadWallpaper);

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
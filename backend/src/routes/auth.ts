import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../middleware/passport';
import { authLimiter } from '../middleware/rateLimiting';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GitHub OAuth login
router.get('/github', authLimiter, passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get('/github/callback',
  authLimiter,
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const user = req.user as any;

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, githubId: user.githubId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side will remove token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../middleware/passport';
import { authLimiter } from '../middleware/rateLimiting';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';

// GitHub OAuth login
router.get('/github', authLimiter, passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get('/github/callback',
  authLimiter,
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const user = req.user!;

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, githubId: user.githubId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect to frontend without token in URL
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback`);
  }
);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout (clear cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;

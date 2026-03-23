import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '@prisma/client';
import prisma from '../lib/prisma';

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: "/api/auth/github/callback"
},
async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { githubId: profile.id }
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value
        }
      });
      return done(null, updatedUser);
    }

    const newUser = await prisma.user.create({
      data: {
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value
      }
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

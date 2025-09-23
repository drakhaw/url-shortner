const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id }
      });

      if (user) {
        // Update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
        return done(null, user);
      }

      // Check if user exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.emails[0]?.value }
      });

      if (existingUser) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: profile.id,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            lastLoginAt: new Date()
          }
        });
        return done(null, user);
      }

      // Check if this email is allowed to register
      // For now, we'll reject new users - admin must invite them first
      return done(null, false, { 
        message: 'You need to be invited by an administrator to use this application.' 
      });

    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
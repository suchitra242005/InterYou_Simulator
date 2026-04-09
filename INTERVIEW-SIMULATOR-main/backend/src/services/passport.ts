import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import { config } from '../config/index.js';
import { User } from '../models/index.js';

const serializeUser = (_user: any, done: (err: any, id?: any) => void) => {
  done(null, _user._id);
};

const deserializeUser = async (id: any, done: (err: any, user?: any) => void) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
};

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    callbackURL: '/api/auth/google/callback',
  }, async (_accessToken: any, _refreshToken: any, profile: any, done: (err: any, user?: any) => void) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email: email.toLowerCase() });
        }
        
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          user = new User({
            email: profile.emails?.[0]?.value?.toLowerCase() || `google_${profile.id}@placeholder.com`,
            name: profile.displayName,
            googleId: profile.id,
            isEmailVerified: true,
          });
          await user.save();
        }
      }
      
      done(null, user);
    } catch (err) {
      done(err, undefined);
    }
  }));
}

if (config.oauth.github && config.oauth.github.clientId && config.oauth.github.clientSecret) {
  passport.use(new GitHubStrategy({
    clientID: config.oauth.github.clientId,
    clientSecret: config.oauth.github.clientSecret,
    callbackURL: "http://localhost:5000/api/auth/github/callback"
  }, async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
    try {
      console.log("GITHUB PROFILE:", profile);

      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        user = new User({
          name: profile.displayName || profile.username || "GitHub User",
          email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
          githubId: profile.id,
        });

        await user.save();
      }

      done(null, user);
    } catch (err) {
      console.log("GITHUB ERROR:", err);
      done(err, null);
    }
  }));
}

export default passport;

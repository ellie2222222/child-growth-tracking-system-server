import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });

type User = Profile;

const callbackURL = process.env.GOOGLE_CLIENT_URL!;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: User | false) => void
    ) => {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: User | null, done) => {
  done(null, user);
});

export default passport;

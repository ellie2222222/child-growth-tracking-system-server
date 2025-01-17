import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import UserModel from "../models/UserModel";

dotenv.config();

// Define a User type for serialization/deserialization
type User = Profile;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CLIENT_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: User | false) => void) => {
      done(null, profile);
    }
  )
);

// Serialize user information into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user information from the session
passport.deserializeUser((id, done) => {
  UserModel.findById(id).then((user) => {
    done(null, user);
  });
});

export default passport;

require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("custom-passport-apple");
const fs = require("fs");
const path = require("path");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CLIENT_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL: process.env.APPLE_CLIENT_URL,
      keyID: process.env.APPLE_KEY_ID,
      key: fs.readFileSync(
        path.join("./etc/secrets", ".env.AuthKey_QF8K99G583.p8")
      ),
      scope: ["name", "email"],
      // privateKeyString: process.env.APPLE_PRIVATE_KEY,
      // passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, idToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

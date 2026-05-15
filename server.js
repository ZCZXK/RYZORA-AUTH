require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify"]
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: "ryzora_super_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("index", {
    user: req.user
  });
});

app.get(
  "/auth/discord",
  passport.authenticate("discord")
);

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

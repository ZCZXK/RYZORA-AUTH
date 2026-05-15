require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "ryzora_secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify"]
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

app.get("/", (req, res) => {
  res.render("index", {
    user: req.user
  });
});

app.get("/login",
  passport.authenticate("discord")
);

app.get("/callback",
  passport.authenticate("discord", {
    failureRedirect: "/"
  }),
  (req, res) => {
    req.session.save(() => {
      res.redirect("/");
    });
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});

const express = require("express");
const path = require("path");
const http = require("http");
const passport = require("passport");
const mongoose = require('mongoose');
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const flash = require("connect-flash");

//
// Setup event handlers.
//
function setupHandlers(app) {
  app.set("views", path.join(__dirname, "views")); // Set directory that contains templates for views.
  app.set("view engine", "hbs"); // Use hbs as the view engine for Express.

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // Connect to MongoDB
  mongoose.connect('mongodb://db:27017/usersDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));


  // Passport local strategy for user signup
  passport.use(
    "signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await User.create({ email, password: hashedPassword });
          return done(null, user);
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );

  // Passport local strategy for user login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );
          if (!isPasswordValid) {
            return done(null, false, { message: "Incorrect password" });
          }

          return done(null, user);
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );

  // Serialize user object
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user object
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  });

  //
  // Main web page that lists videos.
  //
  app.get('/', (req, res) => {
    res.render('index');
  });
  
  app.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('signupMessage') });
  });
  
  app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: true
  }));
  
  app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('loginMessage') });
  });
  
  app.post('/login', passport.authenticate('login', {
    successRedirect: '/landing',
    failureRedirect: '/signup',
    failureFlash: true
  }));
  
  
  app.get('/logout', (req, res) => {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
      });
    });
  
    app.get('/landing', isLoggedIn, (req, res) => {
      http.request(
        {
          host: `metadata`,
          path: `/videos`,
          method: `GET`,
        },
        (response) => {
          let data = "";
          response.on("data", (chunk) => {
            data += chunk;
          });
    
          response.on("end", () => {
            res.render("video-list", {
              videos: JSON.parse(data).videos,
              email: req.user.email // Pass the user's email as a variable
            });
          });
    
          response.on("error", (err) => {
            console.error("Failed to get video list.");
            console.error(err || `Status code: ${response.statusCode}`);
            res.sendStatus(500);
          });
        }
      ).end();
    });
    

  //
  // Web page to play a particular video.
  //
  app.get("/video", isLoggedIn, (req, res) => {
    const videoId = req.query.id;
    http.request(
      {
        host: `metadata`,
        path: `/video?id=${videoId}`,
        method: `GET`,
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          const metadata = JSON.parse(data).video;
          const video = {
            metadata,
            url: `/api/video?id=${videoId}`,
          };

          res.render("play-video", { video });
        });

        response.on("error", (err) => {
          console.error(`Failed to get details for video ${videoId}.`);
          console.error(err || `Status code: ${response.statusCode}`);
          res.sendStatus(500);
        });
      }
    ).end();
  });

  //
  // Web page to upload a new video.
  //
  app.get("/upload", isLoggedIn, (req, res) => {
    res.render("upload-video", {});
  });

  //
  // HTTP GET API to stream video to the user's browser.
  //
  app.get("/api/video", isLoggedIn, (req, res) => {
    const forwardRequest = http.request(
      {
        host: `video-streaming`,
        path: `/video?id=${req.query.id}`,
        method: "GET",
      },
      (forwardResponse) => {
        res.writeHeader(
          forwardResponse.statusCode,
          forwardResponse.headers
        );
        forwardResponse.pipe(res);
      }
    );

    req.pipe(forwardRequest);
  });

  //
  // HTTP POST API to upload video from the user's browser.
  //
  app.post("/api/upload", isLoggedIn, (req, res) => {
    const forwardRequest = http.request(
      {
        host: `video-upload`,
        path: `/upload`,
        method: "POST",
        headers: req.headers,
      },
      (forwardResponse) => {
        res.writeHeader(
          forwardResponse.statusCode,
          forwardResponse.headers
        );
        forwardResponse.pipe(res);
      }
    );

    req.pipe(forwardRequest);
  });
 // Custom middleware to check if a user is logged in
 function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
  //
  // User signup API
  //
  app.post(
    "/api/signup",
    passport.authenticate("signup", { session: false }),
    async (req, res) => {
      res.json({ message: "Signup successful" });
    }
  );

  //
  // User login API
  //
  app.post(
    "/api/login",
    passport.authenticate("login", { session: false }),
    async (req, res) => {
      const { _id, email } = req.user;
      const token = jwt.sign({ _id, email }, "secret_key");
      res.json({ token });
    }
  );

  //
  // Logout API
  //
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
  });
}

//
// Start the HTTP server.
//
function startHttpServer() {
  return new Promise((resolve) => {
    const app = express();
    setupHandlers(app);

    const port = process.env.PORT && parseInt(process.env.PORT) || 3000;
    app.listen(port, () => {
      resolve();
    });
  });
}

//
// Application entry point.
//
function main() {
  return startHttpServer();
}

main()
  .then(() => console.log("Microservice online."))
  .catch((err) => {
    console.error("Microservice failed to start.");
    console.error(err && err.stack || err);
  });

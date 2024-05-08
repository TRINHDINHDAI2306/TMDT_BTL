const passport = require("passport");
const config = require("config");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const UserModel = require("../src/apps/models/UserModel");
const CustomerModel = require("../src/apps/models/CustomerModel");
const slug = require("slug");
const nodemailer = require("nodemailer");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  UserModel.findById(id).then((user) => {
    done(null, user);
  });
});


const sendNotificationEmail = (email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.get("mail.user"),
      pass: config.get("mail.pass"),
    },
  });

  const mailOptions = {
    from: "Vietpro Store 👻 <quantri.vietproshop@gmail.com>",
    to: email,
    subject: "Đăng nhập thành công",
    text: "Bạn đã đăng nhập thành công Website MobiShop bằng tài khoản Google.",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

passport.use(
  "GoogleStrategy_Customer",
  new GoogleStrategy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL_CUS,
      clientID: process.env.GOOGLE_CLIENT_ID_CUS,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_CUS,
    },
    (accessToken, refreshToken, profile, done) => {
            console.log(profile);

      CustomerModel.findOne({ socialId: profile.id }).then(
        (currentCustomer) => {
          if (currentCustomer) {
            done(null, currentCustomer);
          } else {
            new CustomerModel({
              socialId: profile.id,
              email: profile.emails[0].value,
              username: slug(profile.displayName, { replacement: "" }),
              full_name: profile.displayName,
              avatar: profile.photos[0].value,
            })
              .save()
              .then((newCustomer) => {
                done(null, newCustomer);
              });
          }
        }
      );
      sendNotificationEmail(profile.emails[0].value);
    }
  )
);

passport.use(
  "GoogleStrategy_Admin",
  new GoogleStrategy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },

    (accessToken, refreshToken, profile, done) => {
      UserModel.findOne({ socialId: profile.id }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          new UserModel({
            provider: profile.provider,
            socialId: profile.id,
            email: profile.emails[0].value,
            full_name: profile.displayName,
            username: slug(profile.displayName, { replacement: "" }),
            avatar: profile.photos[0].value,
            role: "admin",
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
      sendNotificationEmail(profile.emails[0].value);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      UserModel.findOne({ socialId: profile.id }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser);
          console.log(profile);
        } else {
          new UserModel({
            provider: profile.provider,
            socialId: profile.id,
            email: profile.emails
              ? profile.emails[0].value
              : "facebook@gmail.com",
            full_name: profile.displayName,
            username: slug(profile.displayName, { replacement: "" }),
            role: "admin",
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      UserModel.findOne({ socialId: profile.id }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          new UserModel({
            provider: profile.provider,
            socialId: profile.id,
            email: profile.email ? profile.email : "github@gmail.com",
            full_name: profile.username || "",
            username: profile.username,
            role: "admin",
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

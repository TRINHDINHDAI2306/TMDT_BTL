const express = require("express");
const router = express.Router();
const passport = require("passport");
const SocialController = require("../apps/controllers/SocialController");
const passportSetup = require("../../config/passport-setup");

router.get(
  "/auth/google",
  passport.authenticate("GoogleStrategy_Admin", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("GoogleStrategy_Admin", {
    failureRedirect: "/admin/login",
  }),
  SocialController.googleCallback
);

router.get("/auth/facebook", passport.authenticate("facebook"));
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/admin/login" }),
  SocialController.facebookCallback
);

router.get("/auth/github", passport.authenticate("github"));
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/admin/login" }),
  SocialController.githubCallback
);

module.exports = router;

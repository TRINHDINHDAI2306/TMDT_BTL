const SocialCusController = require("../apps/controllers/SocialCusController");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportSetup = require("../../config/passport-setup");


router.get(
  "/authCus/google",
  passport.authenticate("GoogleStrategy_Customer", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/authCus/google/callback",
  passport.authenticate("GoogleStrategy_Customer", {
    failureRedirect: "/admin/customers/login",
  }),
  SocialCusController.googleCallbackCus
);

router.get("/authCus/facebook", passport.authenticate("facebook"));
router.get(
  "/authCus/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/admin/customers/login",
  }),
  SocialCusController.facebookCallbackCus
);

router.get("/authCus/github", passport.authenticate("github"));
router.get(
  "/authCus/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/admin/customers/login",
  }),
  SocialCusController.githubCallbackCus
);
module.exports = router;

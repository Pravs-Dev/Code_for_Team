import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const router = express.Router();

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async function (req, res) {
    /* istanbul ignore next */
    try {
      const token = req.user.token;
      const userId = req.user.user._id;
      const role =req.user.role;
      if(role === 'student'){
      res.redirect(`/dashboard.html?token=${token}&userId=${userId}&role=${role}`)
      }
      else{
        res.redirect(`./views/tutor_dashboard.html?token=${token}&userId=${userId}&role=${role}`)
      }
    } catch (error) {
      console.error("Error during Google OAuth callback:", error);
      res.redirect("/");
    }
  }
);

// Logout route
router.get("/logout", function (req, res) {
  /* istanbul ignore next */
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

export default router;

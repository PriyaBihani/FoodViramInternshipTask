const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  signup,
  signin,
  isAuthenticated,
  getProfile,
  changePassword,
} = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("email", "email is required").isEmail(),
    check("password", "Password field is required").isLength({
      min: 1,
    }),
    check("firstName", "firstName is required").notEmpty(),
    check("lastName", "lastName is required").notEmpty(),
    check("age", "age is required").notEmpty(),
  ],
  signup
);

router.post(
  "/login",
  [
    check("email", "email is required").notEmpty(),
    check("password", "Password field is required").isLength({
      min: 1,
    }),
  ],
  signin
);

router.get("/user/profile", isAuthenticated, getProfile);

router.post(
  "/user/change-password",
  [
    check("currentPassword", "currentPassword is required").isLength({
      min: 1,
    }),
    check("newPassword", "newPassword is required").isLength({
      min: 1,
    }),
  ],
  isAuthenticated,
  changePassword
);

module.exports = router;

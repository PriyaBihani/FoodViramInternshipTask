const { validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");

exports.isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    // getting user id from token

    const decodedToken = await jwt.verify(token, config.get("jwtSecret"));
    const userId = decodedToken.user.id;

    try {
      // checking for usr
      const user = await User.findById(userId);
      if (user) {
        // attching user to req
        req.user = user;
      } else {
        return res.json({ message: "No User found in DB" });
      }
    } catch (error) {
      res.json({ message: "Server Error" });
    }
  } catch (err) {
    console.log(err.message);
    res.json({ message: "Invalid token" });
  }
  next();
};

exports.signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        return res.json({ token, userId: user._id });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // destructuring body

  const { firstName, lastName, email, password, age } = req.body;
  // initializing user

  try {
    // Checking if user already exists
    let user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).json({
        errors: [{ msg: "User already exists" }],
      });
    }
    // instantiating new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      age,
    });

    user = new User(req.body);
    // hashing the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // saving the user
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error creating Userr");
  }
};

exports.getProfile = (req, res) => {
  const { email, firstName, lastName, age } = req.user;
  res.json({ UserProfile: { email, firstName, lastName, age } });
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // getting user from the req
  const user = req.user;
  const { newPassword, currentPassword } = req.body;
  try {
    // check if current password mathces old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (isMatch) {
      // hashing new password
      const salt = await bcrypt.genSalt(10);
      newHashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = newHashedPassword;
      // saving the user
      await user.save();
      res.json({ message: "Password changed successfully" });
    } else {
      return res.json({ message: "Current password doesn't match" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error changing password");
  }
};

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();
    res
      .status(201)
      .json({ user: { email: user.email, subscription: user.subscription } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email in use" });
    }
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "1h",
      });
      user.token = token;
      await user.save();
      res.json({
        token,
        user: { email: user.email, subscription: user.subscription },
      });
    } else {
      res.status(401).json({ message: "Email or password is wrong" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/logout", auth, async (req, res) => {
  try {
    req.user.token = null;
    await req.user.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/current", auth, async (req, res) => {
  res.json({ email: req.user.email, subscription: req.user.subscription });
});

module.exports = router;

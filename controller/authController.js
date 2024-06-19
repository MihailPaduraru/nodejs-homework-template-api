const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const passport = require("passport");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");

const secretForToken = process.env.TOKEN_SECRET;

async function login(data) {
  const { email, password } = data;
  const user = await User.findOne({ email, verify });

  if (!user) {
    throw new Error(
      "The username does not exist or the email was not yet validated."
    );
  }
  const isMatching = await bcrypt.compare(password, user.password);

  if (isMatching) {
    const token = jwt.sign({ data: user }, secretForToken, { expiresIn: "1h" });

    await User.findOneAndUpdate({ email }, { token });

    return token;
  } else {
    throw new Error("Email or password is incorrect");
  }
}

async function signup(data) {
  const saltRounds = 10;
  const encryptedPassword = await bcrypt.hash(data.password, saltRounds);
  const userAvatar = gravatar.url(data.email);

  const newUser = new User({
    email: data.email,
    password: encryptedPassword,
    role: "buyer",
    token: null,
    avatarURL: userAvatar,
    verificationToken: token,
    verify: false,
  });

  sendWithSendGrid(data.email, token);

  return User.create(newUser);
}

async function updateToken(email, token) {
  token = token || uuidv4();
  await User.findOneAndUpdate({ email }, { verificationToken: token });
  sendWithSendGrid(email, token);
}

function validateJWT(token) {
  try {
    return jwt.verify(token, secretForToken);
  } catch (err) {
    console.error(err);
    throw new Error("Invalid Token");
  }
}

function getPayloadFromJWT(token) {
  try {
    return jwt.verify(token, secretForToken);
  } catch (err) {
    console.error(err);
    throw new Error("Invalid Token");
  }
}

function validateAuth(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
}

async function getUserByValidationToken(token) {
  const user = await User.findOne({ verificationToken: token, verify: false });

  if (user) {
    return true;
  }

  return false;
}

module.exports = {
  login,
  signup,
  validateJWT,
  getPayloadFromJWT,
  validateAuth,
  getUserByValidationToken,
  updateToken,
};

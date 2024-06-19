const express = require("express");
const AuthController = require("../../controller/authController.js");
const FileController = require("../../controller/fileController.js");
const User = require("../../models/user.js");
const { STATUS_CODES } = require("../../db/constants.js");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const isValid = checkLoginPayload(req.body);
    if (!isValid) {
      throw new Error("The login request is invalid.");
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Username or password is not correct",
        data: "Conflict",
      });
    }

    const token = await AuthController.login({ email, password });

    res.status(STATUS_CODES.success).json({
      message: `Utilizatorul a fost logat cu succes`,
      token: token,
      user: {
        email: user.email,
        role: user.role,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const isValid = checkSignupPayload(req.body);

    if (!isValid) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Incorrect login or password",
        data: "Bad request",
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }

    await AuthController.signup({ email, password });

    res.status(204).json({ message: "Utilizatorul a fost creat" });
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

router.get("/logout", AuthController.validateAuth, async (req, res, next) => {
  try {
    const header = req.get("authorization");
    if (!header) {
      throw new Error("E nevoie de autentificare pentru aceasta ruta.");
    }
    console.log("Token");
    const token = header.split(" ")[1];
    const payload = AuthController.getPayloadFromJWT(token);

    await User.findOneAndUpdate({ email: payload.data.email }, { token: null });

    res.status(204).send();
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

router.get(
  "/users/current",
  AuthController.validateAuth,
  async (req, res, next) => {
    try {
      const header = req.get("authorization");
      if (!header) {
        throw new Error("E nevoie de autentificare pentru aceasta ruta.");
      }

      const token = header.split(" ")[1];
      const payload = AuthController.getPayloadFromJWT(token);

      const user = await User.findOne({ email: payload.data.email });

      res.status(STATUS_CODES.success).json({
        email: user.email,
        user: user.role,
      });
    } catch (error) {
      respondWithError(res, error, STATUS_CODES.error);
    }
  }
);

router.get("/verify/:verificationToken", async (req, res) => {
  const token = req.params.verificationToken;
  const hasUser = await AuthController.getUserByValidationToken(token);

  if (hasUser) {
    try {
      await User.findOneAndUpdate(
        { verificationToken: token },
        { verify: true }
      );
    } catch (error) {
      throw new Error(
        "The username could not be found or it was already validated."
      );
    }

    res.status(200).send({
      message: "Verification successful",
    });
  } else {
    respondWithError(res, new Error("User not found"), STATUS_CODES.error);
  }
});

router.post("/verify", async (req, res) => {
  try {
    const isValid = req.body?.email;
    const email = req.body?.email;

    if (isValid) {
      AuthController.updateToken(email);
      res.status(200).json({
        message: "Verification email sent",
      });
    } else {
      throw new Error("The email field is required");
    }
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

router.patch(
  "/avatars",
  [AuthController.validateAuth, FileController.uploadFile],
  async (req, res) => {
    try {
      const response = await FileController.processAvatar(req, res);
      res.status(STATUS_CODES.success).json(response);
    } catch (error) {
      respondWithError(res, error, STATUS_CODES.error);
    }
  }
);

module.exports = router;

function checkLoginPayload(data) {
  if (!data?.email || !data?.password) {
    return false;
  }

  return true;
}

function checkSignupPayload(data) {
  if (!data?.email || !data?.password) {
    return false;
  }

  if (data?.password > 8) {
    return false;
  }

  return true;
}

function respondWithError(res, error, statusCode) {
  console.error(error);
  res.status(statusCode).json({ message: `${error}` });
}

const express = require("express");
const userRouter = express.Router();
const controller = require("../controllers/userController");
const userInputValidation = require("../middlewares/userInputValidation");

//creating a user
userRouter.post(
  "/signup",
  userInputValidation.validateUserCreation,
  controller.createUser
);

// login a user
userRouter.post(
  "/login",
  userInputValidation.loginValidation,
  controller.loginUser
);

module.exports = userRouter;

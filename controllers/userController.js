const logger = require("../logger");
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// login controller function
const loginUser = async (req, res) => {
  try {
    const userLoginDetail = req.body;

    const user = await UserModel.findOne({ email: userLoginDetail.email }); // checking db for user provided email address
    if (!user) {
      return res.status(404).json({
        message: "User not found.", // handling error if email is not found.
      });
    }

    const userPassword = await user.isValidPassword(userLoginDetail.password); // unhashing password and comparing with one in the db

    if (!userPassword) {
      return res.status(404).json({
        message: "Email or password not correct!", // handling error if password is not found.
      });
    }

    const token = await jwt.sign(
      { email: user.email, _id: user._id }, // signing jwt token for user login
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    logger.error("Login user route || Error event ", error.message);
    return res.status(500).json({
      message: "Server Error",
      err: error.message,
      data: null,
    });
  }
};

// sign up controller function
const createUser = async (req, res) => {
  try {
    const newUserInput = req.body;

    const existingUser = await UserModel.findOne({
      // checking if user already exist
      email: newUserInput.email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already created",
      });
    }

    const newUserObject = await UserModel.create({
      // creating user into mongoDB database
      firstname: newUserInput.firstname,
      lastname: newUserInput.lastname,
      username: newUserInput.username,
      email: newUserInput.email,
      password: newUserInput.password,
    });

    const token = await jwt.sign(
      { email: newUserObject.email },
      process.env.JWT_SECRET, // signing JWTs
      { expiresIn: "1h" }
    );

    // set cookie
    res.cookie("jwt", token, { httpOnly: true, secure: true });

    return res.status(201).json({
      message: "User created successfully", // success message
      user: newUserObject,
      data: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error", // returning error if create user operation failed.
      err: error.message,
    });
  }
};

module.exports = {
  loginUser,
  createUser,
};

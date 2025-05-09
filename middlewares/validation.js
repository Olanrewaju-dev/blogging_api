const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
require("dotenv").config();

const getCookie = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decodedValue = await jwt.verify(token, process.env.JWT_SECRET);

      res.locals.user = decodedValue;

      next();
    } catch (error) {
      logger.error(error.message);
      res.redirect("login");
    }
  } else {
    res.render("index");
  }
};

const bearerTokenAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers;

    if (!authHeader.authorization) {
      return res.status(401).json({
        message: "You are not authorized!",
      });
    }

    const token = authHeader.authorization.split(" ")[1];

    const decoded = await jwt.verify(token, process.env.JWT_SECRET); // verifying the user browser provided token.

    const user = await UserModel.findOne({ _id: decoded._id }); // checking the user id against records in db

    if (!user) {
      return res.status(401).json({
        message: "You are not authorized!", // handling error in not found cases
      });
    }

    req.user = user; // returning user and granting access

    next();
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

module.exports = {
  bearerTokenAuth,
  getCookie,
};

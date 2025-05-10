const express = require("express");
const db = require("./dbConfig/db");
const logger = require("./logger");
require("dotenv").config();

const app = express();

//// requiring routes
const userRouter = require("./routes/userRoute");
const blogRouter = require("./routes/blogRoute");

db.connectToMongoDB();

const port = process.env.PORT;

//// app use
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: false }));
app.use("/users", userRouter);
app.use("/blogs", blogRouter);

/// index route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the blogging app",
  });
});

/// handling route error
app.get("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    data: [],
  });
});

app.listen(port, () => {
  logger.info(`Server is listening on port ${port}`);
});

const express = require("express");
const blogRouter = express.Router();
const validation = require("../middlewares/validation");
const userInputValidation = require("../middlewares/userInputValidation");
const controller = require("../controllers/blogController");

// fetch a list of blogs
blogRouter.get("/", controller.getBlog);

// fetch a single blogs
blogRouter.get("/:id", controller.getABlog);

// paginated and filterable blog route
blogRouter.post("/", validation.bearerTokenAuth, controller.blogSearch);

//creating a blog
blogRouter.post(
  "/create",
  validation.bearerTokenAuth,
  userInputValidation.validBlogInput,
  controller.createBlog
);

// updating blog
blogRouter.post("/:id", validation.bearerTokenAuth, controller.updateBlog);

// deleting a blog
blogRouter.delete("/:id", validation.bearerTokenAuth, controller.deleteBlog);

module.exports = blogRouter;

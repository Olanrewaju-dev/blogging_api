const BlogModel = require("../models/blogModel");
const logger = require("../logger");

/// === create a blog post === ///
const createBlog = async (req, res) => {
  try {
    const blogInput = req.body;

    // algorithm to calculate reading_time
    const averageAdultReadingTime = 200;
    const wordCount = blogInput.body.split(" ").length + 1;

    const readingTime = await Math.round(wordCount / averageAdultReadingTime);
    const blogAuthor = await req.user.firstname;

    const newBlogPost = await BlogModel.create({
      title: blogInput.title,
      body: blogInput.body,
      state: blogInput.state,
      read_count: blogInput.read_count,
      reading_time: readingTime,
      author: blogAuthor,
      tag: blogInput.tag,
      description: blogInput.description,
      owner: req.user._id,
    });

    if (!newBlogPost) {
      logger.debug(
        "Internal server error. Cannot create blog post. Create blog route"
      );
      res.status(500).json({
        message: "Internal server error. Cannot create blog post",
        data: [],
      });
    }

    logger.debug("Blog created successfully");
    return res.status(201).json({
      message: "Blog created successfully", // success message
      data: newBlogPost,
    });
  } catch (error) {
    logger.error("Event error: ", error.message);
    res.status(500).json({
      message: error.message,
      data: [],
    });
  }
};

/// === fetching blogs === ///
const getBlog = async (req, res) => {
  try {
    // handling pagination, fetching limiting to 20 by default
    let { page, size } = req.query;
    if (!page) {
      page = 1;
    }
    if (!size) {
      size = 20;
    }
    const limit = parseInt(size);
    const skip = (page - 1) * size;

    if (size || page) {
      // handling db pagination
      const blogs = await BlogModel.find({}).limit(limit).skip(skip);
      if (!blogs) {
        logger.debug(
          "No blogs found in the database. Fetching all blogs route"
        );
        res.status(404).json({
          message: "No blogs found",
          data: [],
        });
      }

      logger.debug("All blogs fetched successfully");
      res.status(200).json({
        message: "Blogs fetched successfully",
        data: blogs,
      });
    }
  } catch (error) {
    logger.error("Event error: ", error.message);
    res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

/// === fetching a single blogs & increasing the read_count using mongoose $inc function === ///
const getABlog = async (req, res) => {
  try {
    const blogID = req.params.id;

    const singleBlog = await BlogModel.findOneAndUpdate(
      { _id: blogID },
      { $inc: { read_count: 1 } }
    );

    if (!singleBlog) {
      logger.debug(
        "No blogs found in the database. Fetching a single blog route"
      );
      return res.status(404).json({
        message: "Blog not found",
        data: [],
      });
    }

    logger.debug("Single blog fetched successfully");
    return res.status(200).json({
      message: "Blog fetched successfully",
      data: singleBlog,
    });
  } catch (error) {
    logger.error("Get a single blog route.", error.message);
    return res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

/// === blog updating controller ====///
const updateBlog = async (req, res) => {
  try {
    const blogID = req.params.id;

    const newTitle = req.body.title;
    const newBody = req.body.body;

    if (blogID && newBody) {
      const updateBody = await BlogModel.findOneAndUpdate(
        {
          _id: blogID,
        },
        {
          $set: {
            body: newBody,
          },
        }
      );

      if (!updateBody) {
        logger.debug(
          "Internal server error, cannot update blog body. Update blog route."
        );
        return res.status(500).json({
          message: "Internal server error, cannot update blog body", // handling error
          data: [],
        });
      }
      logger.debug("Blog body updated successfully");
      res.status(201).json({
        message: "Blog body updated successfully",
        data: updateBody,
      });
    } else if (blogID && newTitle) {
      const updateTitle = await BlogModel.findByIdAndUpdate(
        // updating blog title
        { _id: blogID },
        { $set: { title: newTitle } }
      );

      if (!updateTitle) {
        logger.debug("Internal server error, cannot update blog title route.");
        return res.status(500).json({
          message: "Internal server error, cannot update blog tile", // handling error
          data: [],
        });
      }
      logger.debug("Blog title upated successfully");
      res.status(201).json({
        message: "Blog title upated successfully",
        data: updateTitle,
      });
    } else if (blogID) {
      const updateState = await BlogModel.findByIdAndUpdate(blogID, {
        // updating blog state
        state: "Published",
      });

      if (!updateState) {
        return res.status(500).json({
          message: "Internal server error, cannot update blog state",
          data: [],
        });
      }

      logger.debug("Blog state updated successfully");
      res.status(201).json({
        message: "Blog state updated successfully",
        data: updateState,
      });
    }
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogID = req.params.id;
    const deleteBlog = await BlogModel.findByIdAndDelete(blogID);

    if (!deleteBlog) {
      res.status(500).json({
        message: "Internal server error", // handling error
        data: [],
      });
    }

    logger.debug("Blog deleted successfully");
    res.status(201).json({
      message: "Blog deleted successfully",
      data: deleteBlog,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

const blogSearch = async (req, res) => {
  try {
    let { page, size } = req.query;

    if (!page) {
      page = 1;
    }
    if (!size) {
      size = 20;
    }
    const limit = parseInt(size);
    const skip = (page - 1) * size;

    const blog = await BlogModel.find({}).limit(limit).skip(skip); // calling db

    if (!blog) {
      res.status(404).json({
        message: "Blog not found", // handling error when db is empty
        data: [],
      });
    }

    res.status(200).json({
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

module.exports = {
  createBlog,
  getBlog,
  getABlog,
  blogSearch,
  updateBlog,
  deleteBlog,
};

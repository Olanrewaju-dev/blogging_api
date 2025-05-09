const BlogModel = require("../models/blogModel");
const logger = require("../logger");

/// === create a blog post === ///
const createBlog = async (req, res) => {
  try {
    const blogInput = req.body;

    // algorithm to calculate reading_time
    const averageAdultReadingTime = 225;
    const wordCount = blogInput.body.trim().split(/\s+/).length;

    const readingTime = await Math.round(wordCount / averageAdultReadingTime);

    // checking if blog already exist
    const existingBlog = await BlogModel.findOne({
      title: blogInput.title,
    });
    if (existingBlog) {
      return res.status(409).json({
        message: "Blog already exist",
        data: [],
      });
    }

    // creating blog into mongoDB database
    const blogAuthor = await req.user.username;

    const newBlogPost = await BlogModel.create({
      title: blogInput.title,
      body: blogInput.body,
      status: blogInput.state,
      read_count: blogInput.read_count,
      reading_time: readingTime,
      author: blogAuthor,
      tag: blogInput.tag,
      excerpt: blogInput.description,
      owner: req.user._id,
    });

    if (!newBlogPost) {
      logger.debug(
        "Internal server error. Cannot create blog post. Create blog route"
      );
      return res.status(500).json({
        message: "Internal server error. Cannot create blog post",
        data: [],
      });
    }

    return res.status(201).json({
      message: "Blog created successfully", // success message
      data: newBlogPost,
    });
  } catch (error) {
    logger.error("Event error: ", error.message);
    return res.status(500).json({
      message: error.message,
      data: [],
    });
  }
};

/// === fetching blogs === ///
const getBlog = async (req, res) => {
  try {
    // handling pagination, fetching limited to 20 by default
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
        return res.status(404).json({
          message: "No blogs found",
          data: [],
        });
      }

      return res.status(200).json({
        message: "Blogs fetched successfully",
        data: blogs,
      });
    }
  } catch (error) {
    logger.error("Event error: ", error.message);
    return res.status(400).json({
      message: error.message,
      data: [],
    });
  }
};

/// === fetching a single blogs & increasing the read_count using mongoose $inc function === ///
const getABlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const singleBlog = await BlogModel.findOneAndUpdate(
      { _id: blogId },
      { $inc: { read_count: 1 } },
      { new: true }
    );

    if (!singleBlog) {
      return res.status(404).json({
        message: "Blog not found.",
        data: [],
      });
    }

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
    const updateFields = req.body;

    if (!blogID || Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "Invalid request. Blog ID and update fields are required.",
        data: [],
      });
    }

    // Find the blog and ensure it belongs to the requesting user
    const blog = await BlogModel.findById(blogID);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found.",
        data: [],
      });
    }

    if (blog.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this blog.",
        data: [],
      });
    }

    // Check if any field in the update is an array and handle it
    const updateQuery = {};
    for (const key in updateFields) {
      if (Array.isArray(updateFields[key])) {
        updateQuery.$push = updateQuery.$push || {};
        updateQuery.$push[key] = { $each: updateFields[key] };
      } else {
        updateQuery.$set = updateQuery.$set || {};
        updateQuery.$set[key] = updateFields[key];
      }
    }

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      blogID,
      updateQuery,
      { new: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: "Blog not found.",
        data: [],
      });
    }

    logger.debug("Blog updated successfully");
    res.status(200).json({
      message: "Blog updated successfully",
      data: updatedBlog,
    });
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

    if (blog.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this blog.",
        data: [],
      });
    }

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

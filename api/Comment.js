const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// Get all comments for a recipe
router.get("/:id", async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.id }).populate("author");
    if (!comments.length) {
      return res.status(404).json({
        message: "No comments found for this recipe.",
      });
    }
    res.json(comments);
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while fetching comments for the recipe.",
      error: err.message,
    });
  }
});

// Add a new comment for a recipe
router.post("/:id", async (req, res) => {
  const { content, author } = req.body;

  try {
    // Validate inputs
    if (!content || !author) {
      return res.status(400).json({
        message: "Both 'content' and 'author' fields are required to create a comment.",
      });
    }

    // Ensure the recipe exists
    const recipeExists = await Recipe.findById(req.params.id);
    if (!recipeExists) {
      return res.status(404).json({
        message: "The recipe you are trying to comment on does not exist.",
      });
    }

    const comment = new Comment({ content, author, recipe: req.params.id });
    const savedComment = await comment.save();

    // Update the recipe with the new comment
    await Recipe.findByIdAndUpdate(req.params.id, { $push: { comments: savedComment._id } });

    res.status(201).json({
      message: "Comment added successfully.",
      comment: savedComment,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to create comment. Please check the data and try again.",
    });
  }
});

// Delete a comment
router.delete("/:id", async (req, res) => {
  try {
    // Check if the comment exists
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({
        message: "The comment you are trying to delete does not exist.",
      });
    }

    // Remove the comment from the associated recipe
    await Recipe.findByIdAndUpdate(deletedComment.recipe, { $pull: { comments: deletedComment._id } });

    res.json({
      message: "Comment deleted successfully.",
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete the comment. Please try again later.",
      error: err.message,
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

// router.post("/recipes", async (req, res) => {
//   try {
//     const recipe = new Recipe(req.body);
//     const savedRecipe = await recipe.save();
//     res.status(201).json({
//       status: "SUCCESS",
//       message: "Recipe created successfully",
//       data: savedRecipe,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "FAILED",
//       message: "Error creating recipe",
//       error: err.message,
//     });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().select(
      "title _id imageURL cooktime level"
    ); // Select only the required fields
    res.json({
      status: "SUCCESS",
      data: recipes,
    });
  } catch (err) {
    res.status(500).json({
      status: "FAILED",
      message: "Error fetching recipes",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("chef", "username email profilePictureURL")
      .populate({
        path: "comments",
        populate: {
          path: "author",  
          select: "username profilePictureURL", 
        }
      }).exec();

    if (!recipe) {
      return res.status(404).json({
        status: "FAILED",
        message: "Recipe not found",
      });
    }

    res.json({
      status: "SUCCESS",
      data: recipe,
    });
  } catch (err) {
    res.status(500).json({
      status: "FAILED",
      message: "Error fetching recipe",
      error: err.message,
    });
  }
});

router.put("/recipes/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("chef", "username email");
    if (!updatedRecipe) {
      return res.status(404).json({
        status: "FAILED",
        message: "Recipe not found",
      });
    }
    res.json({
      status: "SUCCESS",
      message: "Recipe updated successfully",
      data: updatedRecipe,
    });
  } catch (err) {
    res.status(400).json({
      status: "FAILED",
      message: "Error updating recipe",
      error: err.message,
    });
  }
});

router.put("/:userId/like/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({
        status: "FAILED",
        message: "Recipe not found",
      });
    }
    res.json({
      status: "SUCCESS",
      message: "Recipe liked successfully",
      data: updatedRecipe,
    });
  } catch (err) {
    res.status(400).json({
      status: "FAILED",
      message: "Error liking recipe",
      error: err.message,
    });
  }
});

router.put("/:userId/dislike/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        status: "FAILED",
        message: "Recipe not found",
      });
    }
    if (recipe.likes === 0) {
      return res.status(400).json({
        status: "FAILED",
        message: "Recipe has no likes to remove",
      });
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: -1 } },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({
        status: "FAILED",
        message: "Recipe not found",
      });
    }
    res.json({
      status: "SUCCESS",
      message: "Recipe disliked successfully",
      data: updatedRecipe,
    });
  } catch (err) {
    res.status(400).json({
      status: "FAILED",
      message: "Error disliking recipe",
      error: err.message,
    });
  }
});

router.delete("/recipes/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({
        status: "FAILED",
        message: "Recipe not found",
      });
    }
    res.json({
      status: "SUCCESS",
      message: "Recipe deleted successfully",
      data: deletedRecipe,
    });
  } catch (err) {
    res.status(500).json({
      status: "FAILED",
      message: "Error deleting recipe",
      error: err.message,
    });
  }
});

module.exports = router;

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

router.get("/recipes", async (req, res) => {
  try {
    const recipe = await Recipe.find().populate("chef", "username email");
    res.json({
      status: "SUCCESS",
      data: recipe,
    });
  } catch (err) {
    res.status(500).json({
      status: "FAILED",
      message: "Error fetching recipes",
      error: err.message,
    });
  }
});

router.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("chef", "username email")
      .populate({
        path: "comments", 
        match: {}
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

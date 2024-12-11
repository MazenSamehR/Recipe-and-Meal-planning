const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");



router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().select(
      "title _id imageURL cooktime level chef likes"
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

router.put("/:id", async (req, res) => {
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



router.delete("/:id", async (req, res) => {
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

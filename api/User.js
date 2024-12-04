const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("id profilePictureURL username")
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
});


// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("favoriteList followingList Recipes");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err });
  }
});


// Update a user
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Failed to update user", error: err });
  }
}); 

// Delete a user 
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete user", error: err });
  }
});

// Add a new recipe for a user
router.post("/:id/recipes", async (req, res) => {
    const { title, description,ingredients, steps, imageURL, cooktime, level, calories, serves, specialTag } = req.body;
  
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          status: "FAILED",
          message: "User not found",
          body: req.body,
        });
      }
  
      const recipe = new Recipe({
        title,
        description,
        ingredients,
        steps,
        imageURL,
        chef: user._id,
        cooktime,
        level,
        calories,
        serves,
        specialTag,
      });
  
      const savedRecipe = await recipe.save();
  
      user.Recipes.push(savedRecipe._id);
      await user.save();
  
      res.status(201).json({
        statusCode: 201,
        message: "Recipe created successfully",
        body: savedRecipe,
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((error) => error.message);
        return res.status(400).json({
          statusCode: 400,
          message: messages.join(", "),
          body: null,
        });
      }
  
      res.status(500).json({
        statusCode: 500,
        message: "An unexpected error occurred",
        body: req.body,
      });
    }
  });  


router.post("/:id/favoriteList", async (req, res) => {
    const { recipeId } = req.body;
  
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (user.favoriteList.includes(recipeId)) {
        return res.status(400).json({
          message: "Recipe already in favorite list",
        });
      }

      user.favoriteList.push(recipeId);
      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({
        message: "An unexpected error occurred",
        error: err,
      });
    }
});

    
module.exports = router;

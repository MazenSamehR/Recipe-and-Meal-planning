const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const uploadFile = require("../util/cloudinary");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("id profilePictureURL username");
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
    const user = await User.findById(req.params.id).populate(
      "favoriteList followingList Recipes"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err });
  }
});

// Update a user
router.put("/:id", async (req, res) => {
  try {
    const imageBuffer = req.file ? req.file.buffer : null;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    if (imageBuffer) {
      let result = await uploadFile(imageBuffer);
      updatedUser.profilePictureURL = result.secure_url;
    }
    await updatedUser.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err.stack);
    res.status(400).json({ message: "Failed to update user", error: err });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete user", error: err });
  }
});

// Add a new recipe for a user
router.post("/:id/recipes", async (req, res) => {
  const {
    title,
    description,
    ingredients,
    steps,
    imageURL,
    cooktime,
    level,
    calories,
    serves,
    specialTag,
  } = req.body;
  const imageBuffer = req.file ? req.file.buffer : null;
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

    if (imageBuffer) {
      let result = await uploadFile(imageBuffer);
      recipe.imageURL = result.secure_url;
    }

    const savedRecipe = await recipe.save();

    user.Recipes.push(savedRecipe._id);
    await user.save();

    res.status(201).json({
      statusCode: 201,
      message: "Recipe created successfully",
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

router.post("/:followeeId/follow/:followingId", async (req, res) => {
  const { followeeId, followingId } = req.params;
  try {
    const followeeUser = await User.findById(followeeId);
    const followingUser = await User.findById(followingId);
    if (!followeeUser || !followingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (followeeUser === followingUser) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    if (followeeUser.followingList.includes(followingId)) {
      return res.status(400).json({
        message: "User already in following list",
      });
    }

    followeeUser.followingList.push(followingId);
    await followeeUser.save();
    // return sth in the response like this message: , statusCode and body:
    res.json({
      statusCode: 200,
      message: "User followed successfully",
      body: followeeUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});

// make unfollow route
router.post("/:followeeId/unfollow/:followingId", async (req, res) => {
  const { followeeId, followingId } = req.params;
  try {
    const followeeUser = await User.findById(followeeId);
    const followingUser = await User.findById(followingId);
    if (!followeeUser || !followingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (followeeUser === followingUser) {
      return res.status(400).json({
        message: "You cannot unfollow yourself",
      });
    }
    if (!followeeUser.followingList.includes(followingId)) {
      return res.status(400).json({
        message: "User not in following list",
      });
    }
    followeeUser.followingList = followeeUser.followingList.filter(
      (id) => id.toString() !== followingId
    );
    await followeeUser.save();
    res.json({
      statusCode: 200,
      message: "User unfollowed successfully",
      body: followeeUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});

router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "followingList",
      select: "_id",
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.json({
      statusCode: 200,
      message: "User following retrieved successfully",
      body: user.followingList,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});

router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let userFollowerIds = user.followerList.map((follower) => {
      return follower._id;
    });
    console.log("HERHOTUEHTER");
    res.json({
      statusCode: 200,
      message: "User followers retrieved successfully",
      body: userFollowerIds,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});

module.exports = router;

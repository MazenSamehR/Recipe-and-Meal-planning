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
      "favoriteList followingList followerList Recipes likeList"
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
  let {
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

    ingredients = JSON.parse(ingredients);
    steps = JSON.parse(steps);
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
    console.error(err.stack);
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

//route to add to favorite list
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
    res.json({
      statusCode: 200,
      message: "Recipe added to favorite list successfully",
      body: user.favoriteList,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});

//route to remove from favorite list
router.delete("/:id/favoriteList", async (req, res) => {
  const { recipeId } = req.body;

  try {
    const user
    = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (!user.favoriteList.includes(recipeId)) {
      return res.status(400).json({
        message: "Recipe not in favorite list",
      });
    }

    user.favoriteList = user.favoriteList.filter(
      (id) => id.toString() !== recipeId
    );
    await user.save();
    res.json({
      statusCode: 200,
      message: "Recipe removed from favorite list successfully",
      body: user.favoriteList,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});





//route to add to likelist
router.post("/:id/likeList", async (req, res) => {
  const { recipeId } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.likeList.includes(recipeId)) {
      return res.status(400).json({
        message: "Recipe already in like list",
      });
    }

    user.likeList.push(recipeId);
    await user.save();
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
      message: "Recipe not found",
      });
    }
    recipe.likes += 1;
    await recipe.save();
    res.json({
      statusCode: 200,
      message: "Recipe added to like list successfully",
      body: user.likeList,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});


//route to remove from likelist
router.delete("/:id/likeList", async (req, res) => {
  const { recipeId } = req.body;

  try {
    const
    user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (!user.likeList.includes(recipeId)) {
      return res.status(400).json({
        message: "Recipe not in like list",
      });
    }

    user.likeList = user.likeList.filter((id) => id.toString() !== recipeId);
    await user.save();
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }
    recipe.likes -= 1;
    await recipe.save();
    res.json({
      statusCode: 200,
      message: "Recipe removed from like list successfully",
      body: user.likeList,
    });
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
    if (followeeId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const followeeUser = await User.findById(followeeId);
    const followingUser = await User.findById(followingId);

    if (!followeeUser || !followingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (followeeUser.followingList.includes(followingId.toString())) {
      return res.status(400).json({ message: "User already in following list" });
    }

    followeeUser.followingList.push(followingId);
    followingUser.followerList.push(followeeId);

    await followeeUser.save();
    await followingUser.save();

    res.json({
      statusCode: 200,
      message: "User followed successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "An unexpected error occurred", error: err });
  }
});

router.post("/:followeeId/unfollow/:followingId", async (req, res) => {
  const { followeeId, followingId } = req.params;
  try {
    if (followeeId === followingId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const followeeUser = await User.findById(followeeId);
    const followingUser = await User.findById(followingId);

    if (!followeeUser || !followingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!followeeUser.followingList.includes(followingId.toString())) {
      return res.status(400).json({ message: "User not in following list" });
    }

    followeeUser.followingList = followeeUser.followingList.filter(
      (id) => id.toString() !== followingId
    );
    followingUser.followerList = followingUser.followerList.filter(
      (id) => id.toString() !== followeeId
    );

    await followeeUser.save();
    await followingUser.save();

    res.json({
      statusCode: 200,
      message: "User unfollowed successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "An unexpected error occurred", error: err });
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

//get recipes that is in favorite list
router.get("/:id/favoriteList", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: "favoriteList",
      model: "Recipe",
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.json({
      statusCode: 200,
      message: "Favorite recipes retrieved successfully",
      body: user.favoriteList,
    });
  } catch (err) {
    res.status(500).json({
      message: "An unexpected error occurred",
      error: err,
    });
  }
});



module.exports = router;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePictureURL: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
  favoriteList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      default: [],
    },
  ],
  likeList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      default: [],
    },
  ],
  followingList: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  followerList: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  Recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      default: [],
    },
  ],
  Education: {
    type: String,
    default: null,
  },
  Award: {
    type: String,
    default: null,
  },
  Meals: [
    {
      key: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner"],
        required: true,
      },
      recipe: {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
        required: true,
      },
    },
  ],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

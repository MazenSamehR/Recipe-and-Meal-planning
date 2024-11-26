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
  },
  favoriteList: [
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
  Recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
        default: [],
    },
  ],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

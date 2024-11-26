const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UNIT_ENUM = Object.freeze({
  gram: "g",
  kilogram: "kg",
  liter: "l",
  milliliter: "ml",
  piece: "pcs",
  teaspoon: "tsp",
  tablespoon: "tbsp",
  cup: "cup",
});

const LEVEL_ENUM = Object.freeze({
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
});

const RecipeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: {
          values: Object.values(UNIT_ENUM),
          message: `{VALUE} is not a valid unit}`,
        },
        required: true,
      },
    },
  ],
  steps: [
    {
      type: String,
    },
  ],
  imageURL: {
    type: String,
  },
  chef: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  cooktime: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    enum: {
      values: Object.values(LEVEL_ENUM),
      message: `{VALUE} is not a valid level`,
    },
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  serves: {
    type: Number,
    required: true,
  },
  specialTag: {
    type: String,
  },
});
const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;

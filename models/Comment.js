const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipe: {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
        required: true,
    },
});

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;

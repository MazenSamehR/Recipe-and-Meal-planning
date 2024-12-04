require("dotenv").config();
require("./config/db");
const cors = require("cors");

const app = require('express')();
const port = process.env.PORT;
const bodyParser = require('express').json;
const authRouter = require("./api/Auth");
const RecipeRouter = require("./api/Recipe");
const UserRouter = require("./api/User");
const CommentRouter = require("./api/Comment");

app.use(cors());
app.use(bodyParser());
app.use("/auth", authRouter);
app.use("/recipe", RecipeRouter);
app.use("/user", UserRouter);
app.use("/comment", CommentRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 

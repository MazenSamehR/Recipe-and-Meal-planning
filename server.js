require("dotenv").config();
require("./config/db");
const app = require('express')();
const port = process.env.PORT;
const bodyParser = require('express').json;
const UserRouter = require("./api/Auth");


app.use(bodyParser());
app.use("/user", UserRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

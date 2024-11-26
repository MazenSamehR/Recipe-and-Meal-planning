const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post("/signup", (req, res) => {
  let { username, email, password } = req.body;
  username = username.trim();
  email = email.trim();
  password = password.trim();

  if (username === "" || email === "" || password === "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields!",
    });
  } else if (!/^(?!.*[_.]{2})[a-zA-Z0-9._\s]{3,20}$/.test(username)) {
    res.json({
      status: "FAILED",
      message: "Invalid username!",
    });
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email!",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "FAILED",
            message: "Email already exists!",
          });
        } else {
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                username,
                email,
                password: hashedPassword,
              });

              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "User created successfully!",
                    data: result,
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "FAILED",
                    message: "An error occurred while saving user account!",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occurred while hashing password!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty credintials supplied!",
    });
  }
  
  User.findOne({ email })
    .then((user) => {
      if (user) {
        bcrypt
          .compare(password, user.password)
          .then((isMatch) => {
            if (isMatch) {
              const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
                expiresIn: "6h", 
              });
              res.json({
                status: "SUCCESS",
                message: "Signin successful",
                token,
                data: { username: user.username, email: user.email },
              });
            } else {
              res.json({
                status: "FAILED",
                message: "Invalid email or password!",
              });
            }
          })
          .catch(() => {
            res.json({
              status: "FAILED",
              message: "An error occurred while comparing password!",
            });
          });
      } else {
        res.json({
          status: "FAILED",
          message: "Invalid email or password!",
        });
      }
    })
    .catch(() => {
      res.json({
        status: "FAILED",
        message: "An error occurred during login!",
      });
    });
});

module.exports = router;

const express = require("express");
const userRouter = require("./userRouter");
const mainRouter = express.Router();
const repoRouter = require("./repoRouter");
const issueRouter = require("./issueRouter");
const path = require("path");
mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
const app = express();

mainRouter.get("/", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "Please Log in....!");
    return res.redirect("/login");
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
    return res.render("index");
  } catch (err) {
    res.clearCookie("token");
    req.flash("error", "Session expired. Please log in again.");
    return res.redirect("/login");
  }
});

mainRouter.get("/signup", (req, res) => {
  res.render("signup");
});

mainRouter.get("/login", (req, res) => {
  const error = req.flash("error");
  res.render("login", { error: error.length ? error[0] : null });
});

mainRouter.get("/contact", (req, res) => {
  res.render("index");
});

mainRouter.get("/dashboard", (req, res) => {
  res.render("index");
});

module.exports = mainRouter;

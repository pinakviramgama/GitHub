const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/getUserProfile/:id", userController.getUserProfile);
userRouter.put("/updateUserProfile/:id", userController.updateUserProfile);
userRouter.delete("/deleteUserProfile/:id", userController.deleteUserProfile);

module.exports = userRouter;

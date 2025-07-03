const express = require("express");
const issueController = require("../controllers/issueController");
const issueRouter = express.Router();

issueRouter.get("/issue/getAll", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);
issueRouter.delete("/issue/delete/:id", issueController.deleteIssue);
issueRouter.post("/issue/create", issueController.createIssue);
issueRouter.put("/issue/update/:id", issueController.updateIssue);

module.exports = issueRouter;

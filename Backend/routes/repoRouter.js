const express = require("express");
const repoController = require("../controllers/repoController");
const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepo);
repoRouter.get("/repo/getAllRepo", repoController.getAllRepo);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepo);
repoRouter.get("/repo/getRepoByName/:reponame", repoController.fetchRepoByName);
repoRouter.get("/repo/:userName", repoController.fetchRepoForCurrentUser);
repoRouter.put("/repo/update/:id", repoController.updateRepoById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);

module.exports = repoRouter;

const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Repository = require("../models/repoModel");

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/githubclone";
let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log("✅ MongoDB Connected!");
  }
}

const createRepo = async (req, res) => {
  const { owner, reponame, issues, content, description, visibility } =
    req.body;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");
    const userCollection = db.collection("users");

    // Prepare new repository object
    const newRepository = {
      owner, // this is expected to be the userId as string
      reponame,
      issues,
      content,
      description,
      visibility,
      createdAt: new Date(),
    };

    // Insert the new repo
    const result = await repoCollection.insertOne(newRepository);
    const newRepoId = result.insertedId;

    // Update the user’s repositories array
    await userCollection.updateOne(
      { _id: new ObjectId(owner) }, // Match user by ObjectId
      { $push: { repositories: newRepoId } }
    );

    res.status(201).json({
      message: "Repo Created Successfully",
      repo: { ...newRepository, _id: newRepoId },
    });
  } catch (err) {
    console.error("Error in creating repository:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getRepoById = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoId = req.params.id;

    if (!ObjectId.isValid(repoId)) {
      return res.status(400).json({ message: "Invalid repository ID" });
    }

    const repo = await db
      .collection("repositories")
      .findOne({ _id: new ObjectId(repoId) });

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    res.status(200).json({ repository: repo });
  } catch (err) {
    console.error("Error fetching repository:", err.message);
    res
      .status(500)
      .json({ message: "Error fetching repository: " + err.message });
  }
};

const getAllRepo = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");

    const repos = await db.collection("repositories").find({}).toArray();

    res.json(repos);
  } catch (err) {
    console.error("Error fetching repositories:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching repos" });
  }
};

const deleteRepo = async (req, res) => {
  const repoId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    // Check if repo exists
    const repo = await repoCollection.findOne({ _id: new ObjectId(repoId) });

    if (!repo) {
      return res.status(404).json({ message: "Repo not found" });
    }

    // Delete repo
    await repoCollection.deleteOne({ _id: new ObjectId(repoId) });

    res.status(200).json({ message: "Repo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting repo: " + err.message });
  }
};

const starRepo = async (req, res) => {
  const repoId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    // Make sure repo is found
    const repo = await repoCollection.findOne({ _id: new ObjectId(repoId) });

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const newStarredStatus = !repo.starred;

    await repoCollection.updateOne(
      { _id: new ObjectId(repoId) },
      { $set: { starred: newStarredStatus } }
    );

    res.json({
      success: true,
      starred: newStarredStatus,
    });
  } catch (err) {
    console.error("Error toggling star:", err);
    res.status(500).json({ message: "Error toggling star: " + err.message });
  }
};

const pinRepo = async (req, res) => {
  const repoId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    // Make sure repo is found
    const repo = await repoCollection.findOne({ _id: new ObjectId(repoId) });

    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const newPinnedStatus = !repo.pinned;

    await repoCollection.updateOne(
      { _id: new ObjectId(repoId) },
      { $set: { pinned: newPinnedStatus } }
    );

    res.json({
      success: true,
      pinned: newPinnedStatus,
    });
  } catch (err) {
    console.error("Error toggling pin:", err);
    res.status(500).json({ message: "Error toggling pin: " + err.message });
  }
};

const fetchRepoByName = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    const repoName = req.params.reponame;

    console.log(repoName);

    const result = await repoCollection.findOne({ reponame: repoName });

    console.log(result);

    res
      .status(200)
      .json({ message: "Repo fetched successfully", repo: result });
  } catch (err) {
    res.status(500).json({ message: "Error in fetching repo: " + err.message });
  }
};

const fetchRepoForCurrentUser = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");
    const users = db.collection("users");

    const username = req.params.userName;

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await repoCollection
      .find({ owner: user._id.toString() })
      .toArray();

    res
      .status(200)
      .json({ message: "Repositories fetched successfully", repos: result });
  } catch (err) {
    res.status(500).json({ message: "Error in fetching repo: " + err.message });
  }
};

const updateRepoById = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    const { id } = req.params;
    const updateData = req.body; // Assuming updated fields are sent in req.body

    const result = await repoCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Repository not found or no changes made" });
    }

    res.status(200).json({ message: "Repository updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating repository: " + err.message });
  }
};

const toggleVisibilityById = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    const { id } = req.params;

    const repo = await repoCollection.findOne({ _id: new ObjectId(id) });
    if (!repo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const updatedVisibility = !repo.visibility;

    await repoCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { visibility: updatedVisibility } }
    );

    res
      .status(200)
      .json({ message: `Visibility toggled to ${updatedVisibility}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error toggling visibility: " + err.message });
  }
};

const searchBar = async (req, res) => {
  try {
    const { query, userId } = req.query;

    if (!query || !userId) {
      return res.status(400).json({ message: "Query and userId are required" });
    }

    const results = await Repository.find({
      owner: userId,
      reponame: { $regex: query, $options: "i" }, // Case-insensitive match
    });

    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error while searching repos" });
  }
};

const deleteRepoById = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    const { id } = req.params;

    const result = await repoCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Repository not found" });
    }

    res.status(200).json({ message: "Repository deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting repository: " + err.message });
  }
};

module.exports = {
  createRepo,
  getAllRepo,
  deleteRepo,
  fetchRepoByName,
  fetchRepoForCurrentUser,
  updateRepoById,
  toggleVisibilityById,
  deleteRepoById,
  getRepoById,
  starRepo,
  pinRepo,
  searchBar,
};

const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

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
    const repoCollection = db.collection("repositories"); // Use correct collection name

    // Create new repo object
    const newRepository = {
      owner,
      reponame,
      issues,
      content,
      description,
      visibility,
      createdAt: new Date(),
    };

    // Insert into MongoDB
    const result = await repoCollection.insertOne(newRepository);

    res
      .status(201)
      .json({ message: "Repo Created Successfully", repo: result });
  } catch (err) {
    console.error(" Error in creating repository:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getAllRepo = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const repoCollection = db.collection("repositories");

    const repos = await repoCollection.find({}).toArray();

    res.json(repos);
  } catch (err) {
    console.log("something went wrong", err);
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
};

const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/githubclone";
let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log("MongoDB Connected!");
  }
}

const createIssue = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const issueCollection = db.collection("issues");

    const { title, description, repository } = req.body;

    const issue = new Issue({
      title,
      description,
      repository,
    });

    const result = await issueCollection.insertOne(issue);

    res
      .status(200)
      .json({ message: "Issue Created Successfully.....!", issue: result });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateIssue = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const issueCollection = db.collection("issues");

    const issueId = req.params.id;
    const updatedData = req.body;

    console.log(issueId);
    console.log(updatedData);

    const result = await issueCollection.updateOne(
      { _id: new ObjectId(issueId) },
      { $set: updatedData }
    );

    console.log(result);

    res.status(200).json({
      message: "Issue updated successfully",
      result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating issue", error: err.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const issueCollection = db.collection("issues");

    const issueId = req.params.id;

    const result = await issueCollection.deleteOne({
      _id: new ObjectId(issueId),
    });

    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting issue", error: err.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const issueCollection = db.collection("issues");

    const result = await issueCollection.find({}).toArray();

    res
      .status(200)
      .json({ message: "Issue Created Successfully.....!", issue: result });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getIssueById = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const issueCollection = db.collection("issues");

    const issueId = req.params.id;
    const result = await issueCollection.findOne({
      _id: new ObjectId(issueId),
    });

    res
      .status(200)
      .json({ message: "Issue Found Successfully.....!", issue: result });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createIssue,
  updateIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
};

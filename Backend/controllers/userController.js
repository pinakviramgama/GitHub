const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
const dotenv = require("dotenv");
const { connect } = require("mongoose");
dotenv.config();
const { ObjectId } = require("mongodb");
const uri = "mongodb://localhost:27017/githubclone";

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

const getAllUsers = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();

    res.json(users);
  } catch (err) {
    console.log("Server error : ", err);
  }
};

const signup = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required." });
  }

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      console.log("user is already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    if (!process.env.JWT_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "JWT secret key is not defined." });
    }

    const token = jwt.sign(
      { id: result.insertedId.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });
    res.redirect("/");

    res.status(201).json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(500).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(500).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });
    res.redirect("/");
  } catch (err) {
    console.log("somethig went wrong", err);
  }
};

const getUserProfile = async (req, res) => {
  const currentID = req.params._id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID),
    });

    res.status(200).json({ message: "user available" });
  } catch (err) {
    return res.status(400).json({ message: "User not found" });
  }
};

const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    if (!ObjectId.isValid(currentID)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    let updateFields = {};
    if (email) updateFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(currentID) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    return res.status(200).json({ message: "User profile updated", result });
  } catch (err) {
    console.error("Error updating user profile:", err.message);
    return res
      .status(500)
      .json({ message: "User profile not updated", error: err.message });
  }
};

const deleteUserProfile = async (req, res) => {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const result = usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    console.log(result);

    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "Profile not deleted" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.log(err.message);

    res.status(404).json({ message: "User not deleted" });
  }
};

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};

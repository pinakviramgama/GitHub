const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGO_URL || "mongodb://localhost:27017/githubclone";
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
    const users = await db.collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Internal server error" });
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

    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this username or email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      password: hashedPassword,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };
    const result = await usersCollection.insertOne(newUser);

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey)
      return res.status(500).json({ message: "JWT secret key not defined." });

    const token = jwt.sign({ id: result.insertedId.toString() }, secretKey, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Change to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.status(201).json({
      message: "Signup successful",
      token,
      userId: result.insertedId.toString(),
    });
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
    const user = await db.collection("users").findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set token in cookie (optional for frontend cookie-based auth)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });

    // ✅ Return required user data to frontend
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  const currentID = req.params.id;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(currentID) });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User available", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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

    let updateFields = {};
    if (email) updateFields.email = email;
    if (password) updateFields.password = await bcrypt.hash(password, 10);

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(currentID) },
        { $set: updateFields },
        { returnDocument: "after" }
      );

    res.status(200).json({ message: "User profile updated", result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "User profile not updated", error: err.message });
  }
};

const deleteUserProfile = async (req, res) => {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");

    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(currentID) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Profile not found or already deleted" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
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

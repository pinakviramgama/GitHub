const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const mainRouter = require("./routes/mainRouter");
const initRepo = require("./controllers/init");
const addRepo = require("./controllers/add");
const commitRepo = require("./controllers/commit");
const pullRepo = require("./controllers/pull");
const revertRepo = require("./controllers/revert");
const pushRepo = require("./controllers/push");

dotenv.config();
const app = express(); // Only ONE express instance
const port = process.env.PORT || 3000;
const mongURL = process.env.mongURL;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "Fronted", "views"));
app.use(express.static(path.join(__dirname, "..", "Fronted", "public")));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const session = require("express-session");
const flash = require("connect-flash");

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

app.use("/", mainRouter);

// Connect to MongoDB
mongoose
  .connect(mongURL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start server via yargs
yargs(hideBin(process.argv))
  .command("start", "starts a new server", {}, startServer)
  .command("init", "Initialize a new repo", {}, initRepo)
  .command(
    "add <file>",
    "add a file to repo",
    (yargs) => {
      yargs.positional("file", {
        describe: "file to add to staging area",
        type: "string",
      });
    },
    (argv) => addRepo(argv.file)
  )
  .command(
    "commit <message>",
    "Commits the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "commit message",
        type: "string",
      });
    },
    (argv) => commitRepo(argv.message)
  )
  .command("pull", "pulls changes from S3", {}, pullRepo)
  .command(
    "push",
    "Push to GitHub",
    (yargs) => {
      yargs
        .option("repo", {
          alias: "r",
          describe: "Repository name",
          type: "string",
          demandOption: true,
        })
        .option("owner", {
          alias: "o",
          describe: "GitHub username or organization",
          type: "string",
          demandOption: true,
        });
    },
    (argv) => pushRepo(argv.repo, argv.owner)
  )
  .command(
    "revert <commitID>",
    "Reverts changes to a commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Revert commit ID",
        type: "string",
      });
    },
    (argv) => revertRepo(argv.commitID)
  )
  .demandCommand(1, "Need at least one command")
  .help().argv;

// Start server function
function startServer() {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      console.log("User joined room:", userID);
    });
  });

  const db = mongoose.connection;
  db.once("open", () => {
    console.log("MongoDB connection open.");
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

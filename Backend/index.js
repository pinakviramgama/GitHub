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

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURL = process.env.MONGO_URL;

// ✅ MongoDB connection
mongoose
  .connect(mongoURL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app",
    ], // allow both dev and prod frontend
    credentials: true,
  })
);

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// ✅ Views and Static Assets (only needed if using EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "Fronted", "views")); // Be careful: folder name is "Fronted", not "Frontend"
app.use(express.static(path.join(__dirname, "..", "Fronted", "public")));

// ✅ Main Routes
app.use("/", mainRouter);

// ✅ CLI commands using yargs
yargs(hideBin(process.argv))
  .command("start", "Start the server", {}, startServer)
  .command("init", "Initialize a new repo", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to staging",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to stage",
        type: "string",
      });
    },
    (argv) => addRepo(argv.file)
  )
  .command(
    "commit <message>",
    "Commit staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => commitRepo(argv.message)
  )
  .command("pull", "Pull from S3", {}, pullRepo)
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
          describe: "GitHub owner",
          type: "string",
          demandOption: true,
        });
    },
    (argv) => pushRepo(argv.repo, argv.owner)
  )
  .command(
    "revert <commitID>",
    "Revert to a commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => revertRepo(argv.commitID)
  )
  .demandCommand(1, "⚠️ At least one command is required")
  .help().argv;

// ✅ Start server and socket
function startServer() {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      console.log("User joined room:", userID);
    });
  });

  mongoose.connection.once("open", () => {
    console.log("✅ MongoDB connection open");
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

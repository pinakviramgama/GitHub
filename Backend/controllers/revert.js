const fs = require("fs").promises;
const path = require("path");

async function revertRepo(commitID) {
  const repoPath = path.resolve(process.cwd(), ".GitFolds");
  const commitsPath = path.join(repoPath, "commits");
  const commitDir = path.join(commitsPath, commitID);

  try {
    // Check if commit directory exists
    await fs.access(commitDir);

    const files = await fs.readdir(commitDir);
    const parentDir = process.cwd(); // Restore to the root directory

    for (const file of files) {
      console.log(`Restoring: ${file}`);
      await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }

    console.log(`✅ Commit reverted with ID: ${commitID}`);
    console.log("✅ Reverted changes successfully");
  } catch (err) {
    console.error("❌ Error reverting commit:", err.message);
  }
}

module.exports = revertRepo;

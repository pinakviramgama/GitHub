async function addRepo(filePath) {
  const fs = require("fs").promises;
  const path = require("path");

  const repoPath = path.resolve(process.cwd(), ".GitFolds");
  const stagingPath = path.join(repoPath, "staging");

  console.log(repoPath);
  console.log(stagingPath);

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);

    await fs.copyFile(filePath, path.join(stagingPath, fileName));
  } catch (err) {
    console.log("some error", err);
  }
}

module.exports = addRepo;

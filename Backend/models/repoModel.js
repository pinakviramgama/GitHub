const mongoose = require("mongoose");
const { Schema } = mongoose;

const repositorySchema = new Schema({
  reponame: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
  },
  visibility: {
    type: Boolean,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
  starred: {
    type: Boolean,
    default: false,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
});

const Repository = mongoose.model("Repository", repositorySchema);

module.exports = Repository;

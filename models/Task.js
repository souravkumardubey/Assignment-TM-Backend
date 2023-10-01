const mongoose = require("mongoose");

const Schema = mongoose.Schema;
/**
 * Task Model
 */
const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  },
  dueDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);

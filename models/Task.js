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
    type: Number,
    default: 1,
  },
  dueDate: {
    type: String,
    required: true,
    default: new Date().toJSON().slice(0, 10)
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Task", PostSchema);

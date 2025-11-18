const mongoose = require("mongoose");

let runJobSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entry_point: {
    type: String,
    default: 'main'
  },
  status: {
    type: String,
    enum: ["queued", "running", "success", "failed"],
    default: "queued"
  },
  queued_at: {
    type: Date,
    default: Date.now
  },
  started_at: {
    type: Date
  },
  finished_at: {
    type: Date
  },
  output: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model("RUN_JOB", runJobSchema);

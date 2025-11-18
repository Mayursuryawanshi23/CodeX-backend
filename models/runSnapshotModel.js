const mongoose = require("mongoose");

let runSnapshotSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RUN_JOB',
    required: true
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  output_url: {
    type: String,
    default: ''
  },
  artifact_url: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("RUN_SNAPSHOT", runSnapshotSchema);

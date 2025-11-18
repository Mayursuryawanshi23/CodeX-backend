const mongoose = require("mongoose");

// Recursive file/folder node structure
const fileNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    default: 'file'
  },
  content: {
    type: String,
    default: ''
  },
  language: String,
  children: [{ type: mongoose.Schema.Types.Mixed }],
  created_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

let projectSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    enum: ["python", "java", "javascript", "cpp", "c", "go", "bash"],
    default: "javascript"
  },
  fileTree: [{
    id: String,
    name: String,
    type: {
      type: String,
      enum: ['file', 'folder']
    },
    content: String,
    language: String,
    children: mongoose.Schema.Types.Mixed,
    created_at: Date
  }],
  files: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['file', 'folder'],
      default: 'file'
    },
    content: {
      type: String,
      default: ''
    },
    language: String,
    parent_id: {
      type: String,
      default: null
    },
    children: [String],
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update modified timestamp before saving
projectSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

projectSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model("Project", projectSchema);
const mongoose = require("mongoose");

const ProjectNotificationSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      ref: "Projects",
      required: true,
      index: true,
    },

    sender: {
      type: String,
      default: "system",
      required: true,
    },

    code: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["minor", "medium", "urgent"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      userId: String,
      username: String,
      projectName: String,
      resourceId: String,
      resourceName: String,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ProjectNotify = mongoose.model(
  "ProjectNotify",
  ProjectNotificationSchema,
  "ProjectNotify"
);

module.exports = ProjectNotify;
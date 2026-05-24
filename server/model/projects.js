const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const projectSchema = new Schema({
    projectId: {type: String, require: true, unique: true},
    userId: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    prefix: {type: String, required: true},
    description: {type: String, required: false},
    apiKey: { type: String, select: false},
    accessKey: { type: String, unique: true, select: false },
    isPublic: {type: Boolean, default: true},
    dataLimit: { type: Number, default: 100 },
}, { timestamps: true });

projectSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const rawApiKey = crypto.randomBytes(32).toString("hex");
      const rawAccessKey = crypto.randomBytes(32).toString("hex");

      this.apiKey = await bcrypt.hash(rawApiKey, saltRounds);
      this.accessKey = await bcrypt.hash(rawAccessKey, saltRounds);
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Project = mongoose.model("Projects", projectSchema, "Projects");
module.exports = Project;
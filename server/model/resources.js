const mongoose = require("mongoose");
const { Schema } = mongoose;

const resourceSchema = new Schema({
  projectId: { type: String, ref: "Project", required: true },
  name: { type: String, required: true },
  schemaFields: {type: Array, default: []},
  records: { type: Array, default: [] },
}, { timestamps: true });

const Resources = mongoose.model("Resources", resourceSchema, "Resources");
module.exports = Resources;
const mongoose = require("mongoose");
const { Schema } = mongoose;

const resourceSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  name: { type: String, required: true },
  records: { type: Array, default: [] },
}, { timestamps: true });

const Resources = mongoose.model("Resources", resourceSchema, "Resources");
module.exports = Resources;
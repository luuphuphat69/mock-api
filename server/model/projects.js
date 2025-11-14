const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require('crypto');

const projectSchema = new Schema({
    userId: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    prefix: {type: String, required: true, unique: true},
    apiKey: { type: String, unique: true, select: false }, 
    dataLimit: { type: Number, default: 100 },
}, { timestamps: true });

projectSchema.pre("save", function(next) {
    // Only generate a new key if the document is new (isNew) or if apiKey is missing
    if (this.isNew) {
        // Generate a 32-byte (64 character hex string) key
        this.apiKey = crypto.randomBytes(32).toString('hex');
    }
    next();
});

const Project = mongoose.model("Projects", projectSchema, "Projects");
module.exports = Project;
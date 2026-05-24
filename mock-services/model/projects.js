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
    apiKey: { type: String, select: false, required: true},
    accessKey: { type: String, unique: true, select: false },
    isPublic: {type: Boolean, default: true},
    dataLimit: { type: Number, default: 100 },
}, { timestamps: true });

projectSchema.pre("save", async function(next) {
    // Only generate a new key if the document is new (isNew) or if apiKey is missing
    if (this.isNew) {
        // Generate a 32-byte (64 character hex string) key
        const rawApiKey = crypto.randomBytes(32).toString('hex');
        const rawAccessKey = crypto.randomBytes(32).toString('hex');

        const hashedAccessKey = bcrypt.hash(rawAccessKey, saltRounds);
        const hashedApiKey = bcrypt.hash(rawApiKey, saltRounds);
        
        this.apiKey = hashedApiKey;
        this.accessKey = hashedAccessKey;
    }
    next();
});

const Project = mongoose.model("Projects", projectSchema, "Projects");
module.exports = Project;
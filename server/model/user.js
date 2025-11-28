const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, enum: ["free", "plus"], default: "free" },
}, { timestamps: true });

const User = mongoose.model("Users", userSchema, "Users");
module.exports = User;
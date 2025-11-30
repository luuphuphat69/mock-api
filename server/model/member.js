const mongoose = require("mongoose");
const MemberSchema = new mongoose.Schema({
    projectId: {
        type: String,
        ref: "Projects",
        required: true,
    },
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    username:{
        type: String
    },
    role: {
        type: String,
        enum: ["owner", "member"],
        required: true,
    },
    permissions: {
        canEdit: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
        canInvite: { type: Boolean, default: false },
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Member", MemberSchema, "Member");
const mongoose = require("mongoose");

const waitingListSchema = new mongoose.Schema({
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
    username: {
        type: String
    },
    requestTime: {
        type: Date,
        default: Date.now,
    }
});

const WaitingList = mongoose.model("WaitingList", waitingListSchema, "WaitingList");
module.exports = WaitingList;
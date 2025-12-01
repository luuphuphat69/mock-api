const mongoose = require("mongoose");
const { Schema } = mongoose;
const LogSchema  = new Schema({
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
    resourceName:{
        type: String
    },
    username: {
        type: String
    },
    action: {
        type: String
    },
    time:{
        type: Date,
        default: Date.now,
    }
})
const Logs = mongoose.model("Logs", LogSchema, "Logs")
module.exports = Logs;
const mongoose = require("mongoose");
const ProjectNotificationSchema = new mongoose.Schema({
    projectId: {
        type: String,
        ref: "Projects",
        required: true,
    },
    sender:{
        type: String,
        required: true,
    },
    code:{
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['minor', 'medium', 'urgent'],
        required: true
    },
    message:{
        type: String,
        required: false
    },
});
const ProjectNotify = mongoose.model("ProjectNotify", ProjectNotificationSchema, "ProjectNotify")
module.exports = ProjectNotify;
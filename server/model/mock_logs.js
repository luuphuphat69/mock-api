const mongoose = require('mongoose');
const mock_logs_schema = new mongoose.Schema({
    projectId: {
        type: String,
        ref: "Projects",
        required: true,
    },
    method: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
    },
    message: {
        type: String
    },
    statusCode: {
        type: Number,
        required: true
    },
    success: {
        type: Boolean,
        required: true
    },
    responseTime: {
        type: Number,
        required: true
    }, // ms
    timestamp: {
        type: Date,
        default: Date.now,
    }
});
const MockLogs = mongoose.model("Mock_Logs", mock_logs_schema, "Mock_Logs");
module.exports = MockLogs;
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
    endpoint: {
        type: String,
        required: false,
    },
    path: {
        type: String,
        required: false,
    },
    error: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false,
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
        required: false
    }, // ms
    timestamp: {
        type: Date,
        default: Date.now,
    },
    filters: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
    },
    recordId: {
        type: String,
        required: false,
    },
    updatedRecord: {
        type: String,
        required: false,
    },
    deletedRecord: {
        type: String,
        required: false,
    }
});
const MockLogs = mongoose.model("Mock_Logs", mock_logs_schema, "Mock_Logs");
module.exports = MockLogs;
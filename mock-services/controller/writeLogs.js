const MockLogs = require('../model/mock_logs');

async function writeMockLog(logData) {
  try {
    await MockLogs.create({
        ...logData,
        timestamp: new Date()
    })
  } catch (err) {
    console.error("Failed to write log to db:", err);
  }
}
module.exports = writeMockLog;
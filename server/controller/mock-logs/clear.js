const MockLogs = require('../../model/mock_logs');
const Members = require('../../model/member');
const { MongoServerError } = require('mongodb');
const { toInteger, toRequiredString } = require('../../utilities/sanitizeRequestData');

const ALLOWED_PERIODS = [7, 30, 90];
const ALL_TIME_PERIOD = 'all';

async function clearMockLogs(req, res) {
    try {
        const projectId = toRequiredString(req.params.projectid || req.params.projectId);
        const requesterId = toRequiredString(req.params.requestid || req.params.requestId);
        const rawPeriod = toRequiredString(req.params.days || req.query.days || req.query.period);
        const isAllTime = rawPeriod && rawPeriod.toLowerCase() === ALL_TIME_PERIOD;
        const periodDays = isAllTime ? null : toInteger(rawPeriod);

        if (!projectId || !requesterId) {
            return res.status(400).json({ message: "Project or requester is invalid" });
        }

        if (!isAllTime && !ALLOWED_PERIODS.includes(periodDays)) {
            return res.status(400).json({ message: "Clear period must be 7, 30, 90 days, or all" });
        }

        const requester = await Members.findOne({ projectId, userId: requesterId });

        if (!requester) {
            return res.status(404).json({ message: "Not found user nor project" });
        }

        if (requester.role !== 'owner' && !requester.permissions?.canDelete) {
            return res.status(400).json({ message: "User not have permission to clear mock logs" });
        }

        const deleteFilter = { projectId };

        if (!isAllTime) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - periodDays);
            deleteFilter.timestamp = { $lt: cutoffDate };
        }

        const result = await MockLogs.deleteMany(deleteFilter);

        return res.status(200).json({
            message: "Mock logs clear",
            days: isAllTime ? ALL_TIME_PERIOD : periodDays,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        if (err instanceof MongoServerError) {
            return res.status(400).json(err);
        }

        return res.status(500).json(err);
    }
}

module.exports = clearMockLogs;

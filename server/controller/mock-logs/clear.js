const MockLogs = require('../../model/mock_logs');
const { MongoServerError } = require('mongodb');
const { toInteger, toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canDelete } = require('../../utilities/authProjectAccess');

const ALLOWED_PERIODS = [7, 30, 90];
const ALL_TIME_PERIOD = 'all';

async function clearMockLogs(req, res) {
    try {
        const projectId = toRequiredString(req.params.projectid || req.params.projectId);
        const rawPeriod = toRequiredString(req.params.days || req.query.days || req.query.period);
        const isAllTime = rawPeriod && rawPeriod.toLowerCase() === ALL_TIME_PERIOD;
        const periodDays = isAllTime ? null : toInteger(rawPeriod);

        if (!projectId) {
            return res.status(400).json({ message: "Project or requester is invalid" });
        }

        if (!isAllTime && !ALLOWED_PERIODS.includes(periodDays)) {
            return res.status(400).json({ message: "Clear period must be 7, 30, 90 days, or all" });
        }

        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!canDelete(access.member)) {
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

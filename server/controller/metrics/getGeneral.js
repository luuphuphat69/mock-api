const MockLogs = require('../../model/mock_logs');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function getGeneralMetrics(req, res) {
    try {
        const projectId = toRequiredString(req.params.projectId);

        if (!projectId) {
            return res.status(400).json({ message: "Project not found" });
        }

        const isProjectExist = await MockLogs.exists({ projectId });

        if (!isProjectExist)
            return res.status(400).json({ message: "Project not found" });

        // ====== DATE RANGE CALCULATIONS ======
        const now = new Date();

        // Current month range
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Previous month range
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = startOfCurrentMonth; // previous month's end is this month's start


        // ====== CURRENT MONTH METRICS ======
        const totalRequestCurrent = await MockLogs.countDocuments({
            projectId,
            timestamp: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth }
        });

        const errorCurrent = await MockLogs.countDocuments({
            projectId,
            success: false,
            timestamp: { $gte: startOfCurrentMonth, $lt: endOfCurrentMonth }
        });

        const successCurrent = totalRequestCurrent - errorCurrent;
        const successRateCurrent = totalRequestCurrent > 0
            ? (successCurrent / totalRequestCurrent) * 100
            : 0;


        // ====== LAST MONTH METRICS ======
        const totalRequestLast = await MockLogs.countDocuments({
            projectId,
            timestamp: { $gte: startOfLastMonth, $lt: endOfLastMonth }
        });

        const errorLast = await MockLogs.countDocuments({
            projectId,
            success: false,
            timestamp: { $gte: startOfLastMonth, $lt: endOfLastMonth }
        });

        const successLast = totalRequestLast - errorLast;
        const successRateLast = totalRequestLast > 0
            ? (successLast / totalRequestLast) * 100
            : 0;


        // ====== GROWTH CALCULATIONS ======
        function calcGrowth(current, last) {
            if (last === 0) return null; // cannot compute growth
            return ((current - last) / last) * 100;
        }

        const growthTotalRequest = calcGrowth(totalRequestCurrent, totalRequestLast);
        const growthErrors = calcGrowth(errorCurrent, errorLast);
        const growthSuccessRate = calcGrowth(successRateCurrent, successRateLast);


        // ====== RESPONSE ======
        return res.status(200).json({
            current: {
                totalRequest: totalRequestCurrent,
                totalErrors: errorCurrent,
                successRate: successRateCurrent
            },
            lastMonth: {
                totalRequest: totalRequestLast,
                totalErrors: errorLast,
                successRate: successRateLast
            },
            growth: {
                totalRequest: growthTotalRequest,   // number or null
                totalErrors: growthErrors,          // number or null
                successRate: growthSuccessRate      // number or null
            }
        });

    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json({ message: `MONGO SERVER ERROR: ${err}` });
        return res.status(500).json(err);
    }
}

module.exports = getGeneralMetrics;

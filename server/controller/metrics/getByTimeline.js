const MockLogs = require('../../model/mock_logs');

async function getByTimeline(req, res) {
    try {
        const { month, year } = req.query;
        const projectId = req.params.projectId;

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const results = await MockLogs.aggregate([
            // first stage
            {
                $match: {
                    projectId: projectId,
                    timestamp: { $gte: start, $lt: end }
                },
            },
            // 2nd stage
            {
                $group: {
                    _id: { date: { $dateToString: { format: "%d-%m-%Y", date: "$timestamp" } } },
                    totalRequests: { $sum: 1 },
                    totalSuccess: { $sum: { $cond: ["$success", 1, 0] } },
                    totalFailed: { $sum: { $cond: ["$success", 0, 1] } }
                }
            },
            // final stage
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        return res.status(200).json(
            results.map(r => ({
                date: r._id.date,
                totalRequests: r.totalRequests,
                totalSuccess: r.totalSuccess,
                totalFailed: r.totalFailed
            }))
        );
    } catch (err) {
        return res.status(500).json(err)
    }
}
module.exports = getByTimeline;
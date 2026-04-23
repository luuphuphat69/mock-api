const MockLogs = require('../../model/mock_logs');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

const getMockLogs = {
    byProject: async (req, res) => {
        try {
            const projectId = toRequiredString(req.params.projectId);
            const { _page = 1, _limit = 20, _from, _to } = req.query;

            // Validate projectId
            if (!projectId) {
                return res.status(400).json({ message: "Missing projectId" });
            }

            // Build base filter
            const filter = { projectId };

            // Date range filter
            if (_from && _to) {
                const fromDate = new Date(_from);
                const toDate = new Date(_to);

                if (isNaN(fromDate) || isNaN(toDate)) {
                    return res.status(400).json({ message: "Invalid date format" });
                }

                if (fromDate > toDate) {
                    return res.status(400).json({ message: "FROM date cannot be greater than TO date" });
                }

                filter.timestamp = {
                    $gte: fromDate,
                    $lte: toDate
                };
            }

            // Pagination with safe validation
            let page = parseInt(_page, 10);
            let limit = parseInt(_limit, 10);

            if (isNaN(page) || page <= 0) page = 1;
            if (isNaN(limit) || limit <= 0) limit = 20;

            const skip = (page - 1) * limit;

            // Count total documents
            const total = await MockLogs.countDocuments(filter);

            // Query logs
            const logs = await MockLogs.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                data: logs
            });

        } catch (err) {
            console.error("getMockLogs error:", err);
            res.status(500).json({ message: "Server error" });
        }
    },

    byMethod: async (req, res) => {
        try {
            const projectId = toRequiredString(req.params.projectId);
            const { method, _page = 1, _limit = 20 } = req.query;

            // Validate projectId
            if (!projectId) {
                return res.status(400).json({ message: "Missing projectid" });
            }

            // Validate method
            const normalizedMethod = toRequiredString(method);

            if (!normalizedMethod) {
                return res.status(400).json({ message: "No method provided" });
            }

            const formatMethod = normalizedMethod.toUpperCase();
            const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

            if (!validMethods.includes(formatMethod)) {
                return res.status(400).json({ message: "Method is not valid" });
            }

            // Pagination validation
            let page = parseInt(_page, 10);
            let limit = parseInt(_limit, 10);

            if (isNaN(page) || page <= 0) page = 1;
            if (isNaN(limit) || limit <= 0) limit = 20;

            const skipVal = (page - 1) * limit;

            // Count total logs
            const total = await MockLogs.countDocuments({
                projectId: projectId,
                method: formatMethod
            });

            // Query logs
            const result = await MockLogs.find({
                projectId: projectId,
                method: formatMethod
            })
                .sort({ timestamp: -1 })
                .skip(skipVal)
                .limit(limit);

            return res.status(200).json({
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                data: result
            });

        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: `MONGO SERVER ERROR: ${err}` });

            return res.status(500).json(err);
        }
    }

}
module.exports = getMockLogs;

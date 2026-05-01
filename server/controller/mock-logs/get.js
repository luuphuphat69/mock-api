const MockLogs = require('../../model/mock_logs');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function parsePagination(query) {
    let page = parseInt(query._page, 10);
    let limit = parseInt(query._limit, 10);

    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 20;

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
}

function parseSuccessQuery(query) {
    const rawSuccess = query.success ?? query.succes;

    if (rawSuccess === undefined || rawSuccess === null || rawSuccess === "" || rawSuccess === "all") {
        return { hasFilter: false };
    }

    const value = String(rawSuccess).trim().toLowerCase();

    if (["true", "yes", "1", "success"].includes(value)) {
        return { hasFilter: true, value: true };
    }

    if (["false", "no", "0", "fail", "failed"].includes(value)) {
        return { hasFilter: true, value: false };
    }

    return { hasFilter: true, error: "Success must be true, false, yes, or no" };
}

function parseDateValue(value, endOfDay = false) {
    const rawValue = String(value);
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    const date = dateOnlyPattern.test(rawValue)
        ? new Date(`${rawValue}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
        : new Date(rawValue);

    return date;
}

function applyDateRangeFilter(filter, query) {
    const from = query._from ?? query.from;
    const to = query._to ?? query.to;

    if (!from && !to) {
        return null;
    }

    const timestamp = {};
    let fromDate;
    let toDate;

    if (from) {
        fromDate = parseDateValue(from);

        if (isNaN(fromDate.getTime())) {
            return "Invalid FROM date format";
        }

        timestamp.$gte = fromDate;
    }

    if (to) {
        toDate = parseDateValue(to, true);

        if (isNaN(toDate.getTime())) {
            return "Invalid TO date format";
        }

        timestamp.$lte = toDate;
    }

    if (fromDate && toDate && fromDate > toDate) {
        return "FROM date cannot be greater than TO date";
    }

    filter.timestamp = timestamp;
    return null;
}

function getSortQuery(query) {
    const rawOrder = query._order ?? query.order ?? query.sort ?? query._sort ?? "desc";
    const order = String(rawOrder).trim().toLowerCase();

    if (["asc", "1", "oldest"].includes(order)) {
        return { sort: { timestamp: 1 } };
    }

    if (["desc", "-1", "newest"].includes(order)) {
        return { sort: { timestamp: -1 } };
    }

    return { error: "Sort must be asc or desc" };
}

function applyMethodFilter(filter, method) {
    const normalizedMethod = toRequiredString(method);

    if (!normalizedMethod) {
        return null;
    }

    const formatMethod = normalizedMethod.toUpperCase();

    if (!validMethods.includes(formatMethod)) {
        return "Method is not valid";
    }

    filter.method = formatMethod;
    return null;
}

function buildMockLogsQuery(projectId, query, method) {
    const filter = { projectId };

    const methodError = applyMethodFilter(filter, method);
    if (methodError) return { error: methodError };

    const successQuery = parseSuccessQuery(query);
    if (successQuery.error) return { error: successQuery.error };
    if (successQuery.hasFilter) filter.success = successQuery.value;

    const dateError = applyDateRangeFilter(filter, query);
    if (dateError) return { error: dateError };

    const sortQuery = getSortQuery(query);
    if (sortQuery.error) return { error: sortQuery.error };

    return {
        filter,
        sort: sortQuery.sort
    };
}

const getMockLogs = {
    byProject: async (req, res) => {
        try {
            const projectId = toRequiredString(req.params.projectId);

            // Validate projectId
            if (!projectId) {
                return res.status(400).json({ message: "Missing projectId" });
            }

            const queryOptions = buildMockLogsQuery(projectId, req.query, req.query.method);
            if (queryOptions.error) {
                return res.status(400).json({ message: queryOptions.error });
            }

            const { page, limit, skip } = parsePagination(req.query);

            // Count total documents
            const total = await MockLogs.countDocuments(queryOptions.filter);

            // Query logs
            const logs = await MockLogs.find(queryOptions.filter)
                .sort(queryOptions.sort)
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
            const { method } = req.query;

            // Validate projectId
            if (!projectId) {
                return res.status(400).json({ message: "Missing projectid" });
            }

            // Validate method
            const normalizedMethod = toRequiredString(method);

            if (!normalizedMethod) {
                return res.status(400).json({ message: "No method provided" });
            }

            const queryOptions = buildMockLogsQuery(projectId, req.query, normalizedMethod);
            if (queryOptions.error) {
                return res.status(400).json({ message: queryOptions.error });
            }

            // Pagination validation
            const { page, limit, skip } = parsePagination(req.query);

            // Count total logs
            const total = await MockLogs.countDocuments(queryOptions.filter);

            // Query logs
            const result = await MockLogs.find(queryOptions.filter)
                .sort(queryOptions.sort)
                .skip(skip)
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

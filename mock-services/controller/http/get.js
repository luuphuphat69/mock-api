const writeLogs = require('../writeLogs')
const Resource = require('../../model/resources');
const Project = require('../../model/projects');

const handler = async (req, res) => {

  const {projectId, endpoint} = req.params
  const recordId = req.params.recordId || null;
  const apiKey = req.header('x-api-key');
  const query = req.query || null;

  // Validate Project
  const project = await Project.findOne({ projectId }).select('+apiKey');

  if (!project) {
    await writeLogs({
      projectId,
      endpoint,
      method: "GET",
      statusCode: 404,
      success: false,
      error: "Project not found",
    });

    return res.status(404).json({ message: "Project not found" })
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {
    await writeLogs({
      projectId,
      endpoint,
      method: "GET",
      statusCode: 401,
      success: false,
      error: "Unauthorized",
    });
    return res.status(401).json({message: "Unauthorized" })
  }

  // Validate Resource
  const resourceDoc = await Resource.findOne({ projectId, endpoint });

  if (!resourceDoc) {
    await writeLogs({
      projectId,
      endpoint,
      method: "GET",
      success: false,
      statusCode: 404,
      error: "Resource not found",
      recordId,
    });

    return res.status(404).json({ message: "Resource not found" })
  }

  // Ensure records array
  let records = Array.isArray(resourceDoc.records)
    ? [...resourceDoc.records]
    : [];

  // ------------------------------
  // 1) GET BY ID
  // ------------------------------
  if (recordId) {
    const found = records.find((r) => String(r.id) === String(recordId));

    if (!found) {
      await writeLogs({
        projectId,
        endpoint,
        method: "GET",
        success: false,
        statusCode: 404,
        error: "Record not found",
        recordId,
      });
  
      return res.status(404).json({ message: "Record not found" })
    }

    await writeLogs({
      projectId,
      endpoint,
      statusCode: 200,
      method: "GET",
      success: true,
      recordId,
    });

    return res.status(200).json(found)
  }

  // ------------------------------
  // 2) FILTER BY QUERY PARAMS (except _ prefixed ones)
  // ------------------------------
  const filterQuery = {};
  for (const key in query) {
    if (!key.startsWith("_")) {
      filterQuery[key] = query[key];
    }
  }

  if (Object.keys(filterQuery).length > 0) {
    records = records.filter((rec) => {
      return Object.entries(filterQuery).every(([key, value]) => {
        return String(rec[key]) === String(value);
      });
    });
  }

  // ------------------------------
  // 3) SORTING
  // ------------------------------
  if (query._sort) {
    const sortField = query._sort;
    const order = query._order === "desc" ? -1 : 1;

    records.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal > bVal) return 1 * order;
      if (aVal < bVal) return -1 * order;
      return 0;
    });
  }

  // ------------------------------
  // 4) PAGINATION (_page, _limit)
  // ------------------------------
  const page = parseInt(query._page || 1, 10);
  const limit = parseInt(query._limit || 10, 10);

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = records.slice(start, end);

  await writeLogs({
    projectId,
    endpoint,
    method: "GET",
    statusCode: 200,
    success: true,
    totalReturned: paginated.length,
    filters: paginated,
  });
  
  // Include pagination info
  return res.status(200).json({
      currentPage: page,
      limit,
      total: records.length,
      totalPages: Math.ceil(records.length / limit),
      data: paginated,
    })
};
module.exports = handler
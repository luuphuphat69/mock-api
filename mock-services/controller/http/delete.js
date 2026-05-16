const Resource = require('../../model/resources');
const { getProjectAuth, scheduleLog } = require('./helpers');
const { getCachedResource, invalidateCache } = require('../../caching/invalidation');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const {projectId, endpoint, recordId} = req.params

  if (!recordId) {
    scheduleLog(res, {
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 400,
      error: "Record ID is required",
    });

    return res.status(400).json({ message: "Record ID is required" });
  }

  // Validate Project
  const project = await getProjectAuth(projectId);
  if (!project) {
    scheduleLog(res, {
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });
    return res.status(400).json({message: "Project not found" })
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {
    scheduleLog(res, {
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 401,
      error: "Unauthorized",
    });
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Validate Resource
  const resourceDoc = await getCachedResource(projectId, endpoint);

  if (!resourceDoc) {
    scheduleLog(res, {
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });
    return res.status(404).json({ message: "Resource not found" })
  }

  const records = Array.isArray(resourceDoc.records)
    ? resourceDoc.records
    : [];

  // Find record
  const recordIndex = records.findIndex(
    (r) => String(r.id) === String(recordId)
  );

  if (recordIndex === -1) {
    scheduleLog(res, {
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Record not found",
    });

    return res.status(404).json({ message: "Record not found" })
  }

  const deletedRecord = records[recordIndex];

  await Resource.updateOne(
    { projectId, endpoint },
    { $pull: { records: { id: deletedRecord.id } } }
  );

  // Invalidate cache
  await invalidateCache(projectId, endpoint);

  scheduleLog(res, {
    method: "DELETE",
    projectId,
    endpoint,
    success: true,
    statusCode: 200,
    deletedRecord: deletedRecord.id
  });

  return res.status(200).json({
      message: "Record deleted",
      deleted: deletedRecord,
    })
};
module.exports = handler

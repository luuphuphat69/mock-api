const Resource = require('../../model/resources');
const { getProjectAuth, scheduleLog } = require('./helpers');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const body = req.body;
  const {projectId, recordId} = req.params
  const endpoint = req.url;
  
  if (!recordId) {
    scheduleLog(res, {
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 400,
      error: "Record ID is required",
    });

    return res.status(400).json({ message: "Record ID is required" });
  }

  // Null body check
  if (body == null) {
    
    scheduleLog(res, {
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 204,
      error: "No content",
    });

    return res.status(204).json({ message: "No content" });
  }

  // Validate Project
  const project = await getProjectAuth(projectId);
  if (!project) {

    scheduleLog(res, {
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });

    return res.status(404).json({ message: "Project not found" });
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {
    scheduleLog(res, {
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 401,
      error: "Unauthorized",
    });

    return res.status(401).json({ message: "Unauthorized" });
  }

  // Validate Resource
  const resourceDoc = await Resource.findOne({ projectId, endpoint }).select('records').lean();

  if (!resourceDoc) {
    scheduleLog(res, {
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });

    return res.status(404).json({ message: "Resource not found" });
  }

  const records = Array.isArray(resourceDoc.records)
    ? resourceDoc.records
    : [];

  // Find Existing Record
  const recordIndex = records.findIndex(
    (r) => String(r.id) === String(recordId)
  );

  if (recordIndex === -1) {
    scheduleLog(res, {
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });
    
    return res.status(404).json({ message: "Record not found" })
  }

  const existingRecord = records[recordIndex];

  // ----------------------------------------
  // Validate ONLY provided fields
  // ----------------------------------------
  for (const key of Object.keys(body)) {
    if (!(key in existingRecord)) {
      scheduleLog(res, {
        method: "PATCH",
        projectId,
        endpoint,
        success: false,
        statusCode: 400,
        error: `Unknown field '${key}'`
      });

      return res.status(400).json({
          message: `Unknown field '${key}'`
      });
    }

    if (typeof body[key] !== typeof existingRecord[key]) {
      scheduleLog(res, {
        method: "PATCH",
        projectId,
        endpoint,
        success: false,
        statusCode: 400,
        error: `Invalid type for '${key}'`,
      });

      return res.status(400).json({
          message: `Field '${key}' must be type '${typeof existingRecord[key]}', got '${typeof body[key]}'`
      });
    }
  }

  // Merge updates
  const updatedRecord = {
    ...existingRecord,
    ...body,
    id: existingRecord.id,
    updatedAt: new Date().toISOString(),
  };

  await Resource.updateOne(
    { projectId, endpoint, 'records.id': existingRecord.id },
    { $set: { 'records.$': updatedRecord } }
  );

  scheduleLog(res, {
    method: "PATCH",
    projectId,
    endpoint,
    success: true,
    statusCode: 200,
    updatedRecord: updatedRecord.id
  });

  return res.status(200).json({
      message: "Record updated",
      record: updatedRecord,
  });
};
module.exports = handler

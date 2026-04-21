const writeLogs = require('../writeLogs')
const Resource = require('../../model/resources');
const Project = require('../../model/projects');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const body = req.body;
  const {projectId, endpoint, recordId} = req.params

  // Missing ID
  if (!recordId) {
    await writeLogs({
      method: "PUT",
      projectId,
      endpoint,
      recordId,
      success: false,
      statusCode: 400,
      error: "Record ID is required",
    });

    return res.status(400).json({message: "Record ID is required" })
  }

  // Missing body
  if (body == null) {
    await writeLogs({
      method: "PUT",
      projectId,
      endpoint,
      recordId,
      statusCode: 204,
      success: false,
      error: "No content",
    });

    return res.status(204).json({ message: "No content" })
  }

  // Validate Project
  const project = await Project.findOne({ projectId }).select('+apiKey');
  if (!project) {
    await writeLogs({
      method: "PUT",
      projectId,
      endpoint,
      recordId,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });

    return res.status(404).json({ message: "Project not found" })
  }

  // Validate API key
  if (!apiKey || apiKey !== project.apiKey) {
    await writeLogs({
      method: "PUT",
      projectId,
      endpoint,
      recordId,
      success: false,
      statusCode: 401,
      error: "Unauthorized",
    });

    return res.status(401).json({ message: "Unauthorized" })
  }

  // Validate Resource
  const resourceDoc = await Resource.findOne({ projectId, endpoint });

  if (!resourceDoc) {
    await writeLogs({
      method: "PUT",
      projectId,
      endpoint,
      recordId,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });

    return res.status(404).json({message: "Resource not found" })
  }

  let records = Array.isArray(resourceDoc.records)
    ? [...resourceDoc.records]
    : [];

  // Find existing record
  const recordIndex = records.findIndex(
    (r) => String(r.id) === String(recordId)
  );

  if (recordIndex === -1) {
    await writeLogs({
      method: "PUT",
      projectId,
      endpoint,
      recordId,
      success: false,
      statusCode: 404,
      error: "Record not found",
    });

    return res.status(404).json({ message: "Record not found" })
  }

  const existingRecord = records[recordIndex];

  // Validate fields & types
  for (const key of Object.keys(body)) {
    if (!(key in existingRecord)) {
      await writeLogs({
        method: "PUT",
        projectId,
        endpoint,
        recordId,
        success: false,
        statusCode: 400,
        error: `Unexpected field '${key}'`,
      });

      return res.status(400).json({
          message: `Unexpected field '${key}'`,
      });
    }

    if (typeof body[key] !== typeof existingRecord[key]) {
      await writeLogs({
        method: "PUT",
        projectId,
        endpoint,
        recordId,
        success: false,
        statusCode: 400,
        error: `Invalid type for '${key}'`,
      });

      return res.status(400).json({
          message: `Field '${key}' must be type '${typeof existingRecord[key]}', got '${typeof body[key]}'`,
      });
    }
  }

  // Force ID consistency
  body.id = existingRecord.id;

  // Add update timestamp
  body.updatedAt = new Date().toISOString();

  // Replace record
  records[recordIndex] = body;

  await Resource.updateOne(
    { projectId, endpoint },
    { $set: { records } }
  );

  // Log success
  await writeLogs({
    method: "PUT",
    projectId,
    endpoint,
    success: true,
    statusCode: 200,
    updatedRecord: recordId,
  });

  return res.status(200).json({
      message: "Record updated",
      record: body,
  });
};
module.exports = handler
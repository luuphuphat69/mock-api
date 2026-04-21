const writeLogs = require('../writeLogs')
const Resource = require('../../model/resources');
const Project = require('../../model/projects');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const {projectId, endpoint, recordId} = req.params

  if (!recordId) {
    await writeLogs({
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 400,
      error: "Record ID is required",
    });

    return res.status(400).json({
      body: JSON.stringify({ message: "Record ID is required" }),
    });
  }

  // Validate Project
  const project = await Project.findOne({ projectId }).select('+apiKey');
  if (!project) {
    await writeLogs({
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });
    return res.status(400).json({
      body: JSON.stringify({ message: "Project not found" }),
    });
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {
    await writeLogs({
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 401,
      error: "Unauthorized",
    });
    return res.status(401).json({
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  }

  // Validate Resource
  const resourceDoc = await Resource.findOne({ projectId, endpoint });

  if (!resourceDoc) {
    await writeLogs({
      method: "DELETE",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });
    return res.status(404).json({
      body: JSON.stringify({ message: "Resource not found" }),
    });
  }

  let records = Array.isArray(resourceDoc.records)
    ? [...resourceDoc.records]
    : [];

  // Find record
  const recordIndex = records.findIndex(
    (r) => String(r.id) === String(recordId)
  );

  if (recordIndex === -1) {
    return res.status(404).json({
      body: JSON.stringify({ message: "Record not found" }),
    });
  }

  const deletedRecord = records[recordIndex];

  // Remove from array
  records.splice(recordIndex, 1);

  await Resource.updateOne(
    { projectId, endpoint },
    { $set: { records } }
  );

  await writeLogs({
    method: "DELETE",
    projectId,
    endpoint,
    success: true,
    statusCode: 200,
    deletedRecord: deletedRecord.id
  });

  return res.status(200).json({
    body: JSON.stringify({
      message: "Record deleted",
      deleted: deletedRecord,
    }),
  });
};
module.exports = handler
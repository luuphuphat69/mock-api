const writeLogs = require('../writeLogs')
const Resource = require('../../model/resources');
const Project = require('../../model/projects');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const body = req.body;
  const {projectId, endpoint, recordId} = req.params

  if (!recordId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Record ID is required" }),
    };
  }

  // Null body check
  if (body == null) {
    
    await writeLogs({
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 204,
      error: "No content",
    });

    return {
      statusCode: 204,
      body: JSON.stringify({ message: "No content" }),
    };
  }

  // Validate Project
  const project = await Project.findOne({ projectId }).select('+apiKey');
  if (!project) {

    await writeLogs({
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Project not found" }),
    };
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {
    await writeLogs({
      method: "PATCH",
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
      method: "PATCH",
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

  // Find Existing Record
  const recordIndex = records.findIndex(
    (r) => String(r.id) === String(recordId)
  );

  if (recordIndex === -1) {
    await writeLogs({
      method: "PATCH",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });
    
    return res.status(404).json({
      body: JSON.stringify({ message: "Record not found" }),
    });
  }

  const existingRecord = records[recordIndex];

  // ----------------------------------------
  // Validate ONLY provided fields
  // ----------------------------------------
  for (const key of Object.keys(body)) {
    if (!(key in existingRecord)) {
      await writeLogs({
        method: "PATCH",
        projectId,
        endpoint,
        success: false,
        statusCode: 400,
        error: `Unknown field '${key}'`
      });

      return res.status(400).json({
        body: JSON.stringify({
          message: `Unknown field '${key}'`,
        }),
      });
    }

    if (typeof body[key] !== typeof existingRecord[key]) {
      await writeLogs({
        method: "PATCH",
        projectId,
        endpoint,
        success: false,
        statusCode: 400,
        error: `Invalid type for '${key}'`,
      });

      return res.status(400).json({
        body: JSON.stringify({
          message: `Field '${key}' must be type '${typeof existingRecord[key]}', got '${typeof body[key]}'`,
        }),
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

  records[recordIndex] = updatedRecord;

  await Resource.updateOne(
    { projectId, endpoint },
    { $set: { records } }
  );

  await writeLogs({
    method: "PATCH",
    projectId,
    endpoint,
    success: true,
    statusCode: 200,
    updatedRecord: updatedRecord.id
  });

  return res.status(200).json({
    body: JSON.stringify({
      message: "Record updated",
      record: updatedRecord,
    }),
  });
};
module.exports = handler
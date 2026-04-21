const writeLogs = require('../writeLogs')
const Resource = require('../../model/resources');
const Project = require('../../model/projects');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const body = req.body;
  const {projectId, endpoint} = req.params

  // Missing body?
  if (body == null) {

    await writeLogs({
      method: "POST",
      projectId,
      endpoint,
      statusCode: 204,
      success: false,
      error: "No content",
    });

    return res.status(204).json({
      body: JSON.stringify({ message: "No content" }),
    });
  }

  // Validate Project
  const project = await Project.findOne({ projectId }).select('+apiKey');
  if (!project) {

    await writeLogs({
      method: "POST",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });

    return res.status(404).json({
      body: JSON.stringify({ message: "Project not found" }),
    });
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {

    await writeLogs({
      method: "POST",
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
      method: "POST",
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

  // Ensure records array
  let records = Array.isArray(resourceDoc.records)
    ? [...resourceDoc.records]
    : [];

  // ----------------------------------------
  // Validate body fields & type checking
  // ----------------------------------------
  if (records.length > 0) {
    const sample = records[0]; // use first record as structure reference

    for (const key of Object.keys(sample)) {
      if (!(key in body)) {

        await writeLogs({
          method: "POST",
          projectId,
          endpoint,
          statusCode: 400,
          success: false,
          error: `Missing required field '${key}'`,
        });

        return res.status(400).json({
          body: JSON.stringify({
            message: `Missing required field '${key}'`,
          }),
        });
      }

      if (typeof body[key] !== typeof sample[key]) {

        await writeLogs({
          method: "POST",
          projectId,
          endpoint,
          success: false,
          statusCode: 400,
          error: `Invalid type for '${key}'`,
        });

        return res.status(400).json({
          body: JSON.stringify({
            message: `Field '${key}' must be type '${typeof sample[key]}', got '${typeof body[key]}'`,
          }),
        });
      }
    }
  }

  // Auto-generate id if not provided
  if (!body.id) {
    body.id = String(Date.now());
  }

  // ----------------------------------------
  // Insert the new record into the array
  // ----------------------------------------
  records.push(body);

  await Resource.updateOne(
    { projectId, endpoint },
    { $set: { records } }
  );
  
  await writeLogs({
    method: "POST",
    projectId,
    endpoint,
    success: true,
    statusCode: 201,
    recordId: body.id,
  });

  return res.status(201).json({
    body: JSON.stringify({
      message: "Record created",
      record: body,
    }),
  });
};
module.exports = handler
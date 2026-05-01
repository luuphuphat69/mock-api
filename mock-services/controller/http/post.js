const Resource = require('../../model/resources');
const { getProjectAuth, scheduleLog } = require('./helpers');

const handler = async (req, res) => {

  const apiKey = req.header('x-api-key');
  const body = req.body;
  const {projectId, endpoint} = req.params

  // Missing body?
  if (body == null) {

    scheduleLog(res, {
      method: "POST",
      projectId,
      endpoint,
      statusCode: 204,
      success: false,
      error: "No content",
    });

    return res.status(204).json({ message: "No content" })
  }

  // Validate Project
  const project = await getProjectAuth(projectId);
  if (!project) {

    scheduleLog(res, {
      method: "POST",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Project not found",
    });

    return res.status(404).json({message: "Project not found" })
  }

  // Validate API Key
  if (!apiKey || apiKey !== project.apiKey) {

    scheduleLog(res, {
      method: "POST",
      projectId,
      endpoint,
      success: false,
      statusCode: 401,
      error: "Unauthorized",
    });

    return res.status(401).json({ message: "Unauthorized" })
  }

  // Validate Resource
  const resourceDoc = await Resource.findOne({ projectId, endpoint }).select('records').lean();

  if (!resourceDoc) {

    scheduleLog(res, {
      method: "POST",
      projectId,
      endpoint,
      success: false,
      statusCode: 404,
      error: "Resource not found",
    });

    return res.status(404).json({ message: "Resource not found" })
  }

  // Ensure records array
  const records = Array.isArray(resourceDoc.records)
    ? resourceDoc.records
    : [];

  // ----------------------------------------
  // Validate body fields & type checking
  // ----------------------------------------
  if (records.length > 0) {
    const sample = records[0]; // use first record as structure reference

    for (const key of Object.keys(sample)) {
      if (!(key in body)) {

        scheduleLog(res, {
          method: "POST",
          projectId,
          endpoint,
          statusCode: 400,
          success: false,
          error: `Missing required field '${key}'`,
        });

        return res.status(400).json({
            message: `Missing required field '${key}'`,
        });
      }

      if (typeof body[key] !== typeof sample[key]) {

        scheduleLog(res, {
          method: "POST",
          projectId,
          endpoint,
          success: false,
          statusCode: 400,
          error: `Invalid type for '${key}'`,
        });

        return res.status(400).json({
            message: `Field '${key}' must be type '${typeof sample[key]}', got '${typeof body[key]}'`,
        });
      }
    }
  }

  // Auto-generate id if not provided
  if (!body.id) {
    body.id = String(Date.now());
  }

  await Resource.updateOne(
    { projectId, endpoint },
    { $push: { records: body } }
  );
  
  scheduleLog(res, {
    method: "POST",
    projectId,
    endpoint,
    success: true,
    statusCode: 201,
    recordId: body.id,
  });

  return res.status(201).json({
      message: "Record created",
      record: body,
  });
};
module.exports = handler

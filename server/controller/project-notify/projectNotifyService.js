const ProjectNotify = require("../../model/project-notification");
const notifyCodes = require("./code-enum");

function fillTemplate(template, data) {
  return template.replace(/{(\w+)}/g, (_, key) => {
    return data[key] || "";
  });
}

async function createProjectNotify({
  projectId,
  code,
  sender = "system",
  data = {},
  metadata = {},
}) {
  const notifyConfig = notifyCodes[code];

  if (!notifyConfig) {
    throw new Error(`Invalid notification code: ${code}`);
  }

  const message = fillTemplate(notifyConfig.template, data);

  return ProjectNotify.create({
    projectId,
    sender,
    code,
    type: notifyConfig.type,
    message,
    metadata,
  });
}

async function upsertProjectNotify({
  projectId,
  code,
  sender = "system",
  data = {},
  metadata = {},
}) {
  const notifyConfig = notifyCodes[code];

  if (!notifyConfig) {
    throw new Error(`Invalid notification code: ${code}`);
  }

  const message = fillTemplate(notifyConfig.template, data);
  const filter = { projectId, code };

  if (metadata.resourceId) {
    filter["metadata.resourceId"] = metadata.resourceId;
  }

  return ProjectNotify.findOneAndUpdate(
    filter,
    {
      $set: {
        projectId,
        sender,
        code,
        type: notifyConfig.type,
        message,
        metadata,
        isRead: false,
      },
    },
    { new: true, upsert: true }
  );
}

async function getProjectNotifies(projectId) {
  return ProjectNotify.find({ projectId }).sort({ createdAt: -1 });
}

async function clearProjectNotifies({ projectId, code, type, notifyId, metadata = {} }) {
  const filter = { projectId };

  if (notifyId) filter._id = notifyId;
  if (code) filter.code = code;
  if (type) filter.type = type;
  if (metadata.resourceId) filter["metadata.resourceId"] = metadata.resourceId;
  if (metadata.userId) filter["metadata.userId"] = metadata.userId;

  return ProjectNotify.deleteMany(filter);
}

module.exports = {
  createProjectNotify,
  upsertProjectNotify,
  getProjectNotifies,
  clearProjectNotifies,
};

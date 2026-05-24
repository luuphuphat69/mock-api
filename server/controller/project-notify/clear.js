const { clearProjectNotifies } = require("./projectNotifyService");
const { toRequiredString } = require("../../utilities/sanitizeRequestData");
const { getProjectMembership, canEdit } = require("../../utilities/authProjectAccess");

async function clearProjectNotify(req, res) {
  try {
    const projectId = toRequiredString(req.params.projectId);
    const code = toRequiredString(req.query.code);
    const type = toRequiredString(req.query.type);
    const notifyId = toRequiredString(req.query.notifyId || req.query.id);

    if (!projectId) {
      return res.status(400).json({ message: "Missing project id" });
    }

    const access = await getProjectMembership(req, projectId);
    if (!access.member) {
      return res.status(access.status).json({ message: access.message });
    }

    if (!canEdit(access.member)) {
      return res.status(403).json({ message: "User not have permission to do this action" });
    }

    const result = await clearProjectNotifies({
      projectId,
      code,
      type,
      notifyId,
    });

    return res.status(200).json({
      message: "Project notifications cleared",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = clearProjectNotify;

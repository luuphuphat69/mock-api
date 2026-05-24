const { getProjectNotifies } = require("./projectNotifyService");
const { toRequiredString } = require("../../utilities/sanitizeRequestData");
const { getProjectMembership } = require("../../utilities/authProjectAccess");

async function getProjectNotify(req, res) {
  try {
    const projectId = toRequiredString(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({ message: "Missing project id" });
    }

    const access = await getProjectMembership(req, projectId);
    if (!access.member) {
      return res.status(access.status).json({ message: access.message });
    }

    const notifications = await getProjectNotifies(projectId);

    return res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = getProjectNotify;

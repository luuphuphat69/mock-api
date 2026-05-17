const Projects = require('../../model/projects');
const crypto = require('crypto');
const { MongoServerError } = require('mongodb');
const Logs = require('../../model/logs');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');

async function renewApiKey(req, res) {
  try {
    const projectId = toRequiredString(req.params.projectid);

    if (!projectId) {
      return res.status(400).json({ message: "Member or project is invalid" });
    }

    const access = await getProjectMembership(req, projectId);
    if (!access.member) {
      return res.status(access.status).json({ message: access.message });
    }

    if (access.member.role !== 'owner') {
      return res.status(403).json({ message: "Only owner can renew API key" });
    }
    const newKey = crypto.randomBytes(32).toString('hex')
    await Projects.findOneAndUpdate(
      { projectId: projectId },
      { $set: { apiKey: newKey} }
    );

    await Logs.create({
      projectId: projectId,
      userId: access.requesterId,
      username: access.member.username,
      action: 'Generate new API key'
    })

    return res.status(200).json({ message: "API key renewed", newKey });

  } catch (err) {
    console.error(err);

    if (err instanceof MongoServerError) {
      return res.status(400).json({
        message: `MONGO SERVER ERROR: ${err.message}`
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = renewApiKey;

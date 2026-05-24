const Projects = require('../../model/projects');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { MongoServerError } = require('mongodb');
const Logs = require('../../model/logs');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');
const { createProjectNotify } = require('../project-notify/projectNotifyService');

async function renewApiKey(req, res) {
  try {
    const projectId = toRequiredString(req.params.projectid);
    const keyType = toRequiredString(req.query.type);
    const saltRounds = 10;

    if (!projectId) {
      return res.status(400).json({ message: "Member or project is invalid" });
    }

    const access = await getProjectMembership(req, projectId);
    if (!access.member) {
      return res.status(access.status).json({ message: access.message });
    }

    if (access.member.role !== 'owner') {
      return res.status(403).json({ message: "Only owner can renew key" });
    }

    const newKey = crypto.randomBytes(32).toString('hex')
    const hashedKey = await bcrypt.hash(newKey, 10)

    const normalizedKeyType = keyType.toLowerCase();

    switch (normalizedKeyType) {
      case 'api':
        await Projects.findOneAndUpdate(
          { projectId: projectId },
          { $set: { apiKey: hashedKey } }
        );
        break;

      case 'access':
        await Projects.findOneAndUpdate(
          { projectId: projectId },
          { $set: { accessKey: hashedKey } }
        );
        break;

      default:
        return res.status(400).json({ message: "Invalid key type" });
    }

    await Logs.create({
      projectId: projectId,
      userId: access.requesterId,
      username: access.member.username,
      action: `Generate new ${keyType} key`
    })

    const project = await Projects.findOne({ projectId });
    await createProjectNotify({
      projectId,
      code: normalizedKeyType === 'api' ? '201' : '202',
      sender: access.requesterId,
      data: { project: project?.name || projectId },
      metadata: {
        userId: access.requesterId,
        username: access.member.username,
        projectName: project?.name || projectId,
      },
    });

    return res.status(200).json({ message: `${keyType} is generated !`, newKey });

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

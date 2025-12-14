const Member = require('../../model/member');
const Projects = require('../../model/projects');
const crypto = require('crypto');
const { MongoServerError } = require('mongodb');

async function renewApiKey(req, res) {
  try {
    const requestId = req.params.requestid;
    const projectId = req.params.projectid;

    const requester = await Member.findOne({
      projectId,
      userId: requestId
    });

    if (!requester) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (requester.role !== 'owner') {
      return res.status(403).json({ message: "Only owner can renew API key" });
    }
    const newKey = crypto.randomBytes(32).toString('hex')
    await Projects.findOneAndUpdate(
      { projectId: projectId },
      { $set: { apiKey: newKey} }
    );

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
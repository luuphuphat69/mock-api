const Member = require('../../model/member');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

const leaveProject = async (req, res) => {
  try {
    const projectId = toRequiredString(req.params.projectId);
    const requesterId = toRequiredString(req.user?.id);

    if (!requesterId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    if (!projectId) {
      return res.status(400).json({
        message: 'Missing project id',
      });
    }

    const member = await Member.findOne({
      projectId,
      userId: requesterId,
    });

    if (!member) {
      return res.status(404).json({
        message: 'Membership not found',
      });
    }

    await Member.findOneAndDelete({
      projectId,
      userId: requesterId,
    });

    return res.status(200).json({
      message: `User left project ${projectId}`,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = leaveProject;

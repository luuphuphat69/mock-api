const WaitingList = require('../../model/waitinglist')
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');
const { clearProjectNotifies } = require('../project-notify/projectNotifyService');

const RemoveFromWaitingList = async (req, res) => {
    try {
        const projectId = toRequiredString(req.params.projectId);
        const userId = toRequiredString(req.query.user);
        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (access.member.role === 'owner') {
            const result = await WaitingList.deleteOne({ projectId, userId })
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Waiting list request not found' })
            }

            await clearProjectNotifies({
                projectId,
                code: '104',
                metadata: { userId },
            })

            return res.status(200).json({ message: 'Removed user from waiting list' })
        }
        return res.status(400).json({ message: 'User not have permission to do this action' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: 'Internal server error'})
    }
}
module.exports = RemoveFromWaitingList

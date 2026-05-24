const Member = require('../../model/member');
const Project = require('../../model/projects');
const WaitingList = require('../../model/waitinglist');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');
const {
    clearProjectNotifies,
    createProjectNotify,
} = require('../project-notify/projectNotifyService');

const AcceptWaitingListRequest = async (req, res) => {
    try {
        const projectId = toRequiredString(req.params.projectId);
        const userId = toRequiredString(req.query.user);

        if (!projectId || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (access.member.role !== 'owner') {
            return res.status(400).json({ message: 'User not have permission to do this action' });
        }

        const request = await WaitingList.findOne({ projectId, userId });
        if (!request) {
            return res.status(404).json({ message: 'Waiting list request not found' });
        }

        const existingMember = await Member.findOne({ projectId, userId });
        if (!existingMember) {
            await Member.create({
                projectId,
                userId,
                username: request.username,
                role: 'guest',
            });
        }

        const project = await Project.findOne({ projectId });
        const projectName = project?.name || projectId;

        await WaitingList.deleteOne({ projectId, userId });
        await clearProjectNotifies({
            projectId,
            code: '104',
            metadata: { userId },
        });

        await createProjectNotify({
            projectId,
            code: '100',
            sender: access.requesterId,
            data: {
                user: request.username || userId,
                project: projectName,
            },
            metadata: {
                userId,
                username: request.username,
                projectName,
            },
        });

        return res.status(200).json({ message: 'Waiting list request accepted' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = AcceptWaitingListRequest;

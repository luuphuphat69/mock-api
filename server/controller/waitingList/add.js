const WaitingList = require('../../model/waitinglist');
const Project = require('../../model/projects');
const Member = require('../../model/member');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { createProjectNotify } = require('../project-notify/projectNotifyService');

const addToWaitingList = async (req, res) => {
    try {
        const requestId = toRequiredString(req.user.id);
        const username = toRequiredString(req.user.name);
        const projectId = toRequiredString(req.params.projectId);

        if (!requestId || !username || !projectId)
            return res.status(400).json({ message: 'Missing required fields' })

        const isMember = await Member.findOne({ userId: requestId, projectId: projectId });
        if (isMember)
            return res.status(400).json({ message: 'User has already joined this project' })

        const isInWaitingList = await WaitingList.findOne({ userId: requestId, projectId: projectId });
        if (isInWaitingList)
            return res.status(400).json({ message: 'User already request to join. Please wait for the owner to check' })

        const project = await Project.findOne({ projectId });

        await WaitingList.create({
            projectId,
            userId: requestId,
            username
        })

        await createProjectNotify({
            projectId,
            code: '104',
            sender: requestId,
            data: {
                user: username,
                project: project?.name || projectId,
            },
            metadata: {
                userId: requestId,
                username,
                projectName: project?.name || projectId,
            },
        })

        return res.status(201).json({ message: 'User is added to waiting list. Please wait for the owner to check' })
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' })
    }
}
module.exports = addToWaitingList

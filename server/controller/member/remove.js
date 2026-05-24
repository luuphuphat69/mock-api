const Member = require('../../model/member');
const Project = require('../../model/projects');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canDelete } = require('../../utilities/authProjectAccess');
const { createProjectNotify } = require('../project-notify/projectNotifyService');

async function removeMember(req, res) {
    try {
        const userid = toRequiredString(req.params.userid);
        const projectid = toRequiredString(req.params.projectid);

        if (!userid || !projectid)
            return res.status(400).json({ message: "Requester, user or project is invalid" });

        const access = await getProjectMembership(req, projectid);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (canDelete(access.member)) {
            const member = await Member.findOne({ projectId: projectid, userId: userid })
            if (!member) {
                return res.status(404).json({ message: 'Member not found' })
            }
            if (member.role === 'owner') {
                return res.status(404).json({ message: `Cannot remove project's owner` })
            }
            await Member.deleteOne({ _id: member._id })
            const project = await Project.findOne({ projectId: projectid });
            await createProjectNotify({
                projectId: projectid,
                code: '101',
                sender: access.requesterId,
                data: {
                    user: member.username || userid,
                    project: project?.name || projectid,
                },
                metadata: {
                    userId: userid,
                    username: member.username,
                    projectName: project?.name || projectid,
                },
            })
            return res.status(200).json({ message: 'Member is removed' })
        }
        return res.status(400).json({ message: 'User not have enough rights to do it' })

    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(404).json(err)
        return res.status(500).json(err);
    }
}
module.exports = removeMember;

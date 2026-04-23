const Member = require('../../model/member');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function removeMember(req, res) {
    try {
        const requesterId = toRequiredString(req.params.requesterid);
        const userid = toRequiredString(req.params.userid);
        const projectid = toRequiredString(req.params.projectid);

        if (!requesterId || !userid || !projectid)
            return res.status(400).json({ message: "Requester, user or project is invalid" });

        const isRequesterValid = await Member.findOne({ userId: requesterId, projectId: projectid });

        if (!isRequesterValid) {
            return res.status(404).json({ message: "Not found user nor project" });
        }

        if (isRequesterValid.role === 'owner' || isRequesterValid.permissions.canDelete) {
            const member = await Member.findOne({ projectId: projectid, userId: userid })
            if (!member) {
                return res.status(404).json({ message: 'Member not found' })
            }
            if (member.role === 'owner') {
                return res.status(404).json({ message: `Cannot remove project's owner` })
            }
            await Member.deleteOne({ _id: member._id })
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

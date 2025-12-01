const Member = require('../../model/member');
const { MongoServerError } = require('mongodb');

async function removeMember(req, res) {
    try {
        const requesterId = req.params.requesterid;
        const userid = req.params.userid;
        const projectid = req.params.projectid;

        if (!userid || !projectid)
            return res.status(400);

        const isRequesterValid = await Member.findOne({ userId: requesterId, projectId: projectid });

        if (isRequesterValid.role === 'owner' || isRequesterValid.permissions.canDelete) {
            const member = await Member.findOne({ projectId: projectid, userId: userid })
            if (member.role === 'owner') {
                return res.status(404).json({ message: `Cannot remove project's owner` })
            }
            await Member.deleteOne(member)
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
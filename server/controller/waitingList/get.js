const WaitingList = require('../../model/waitinglist');
const { getProjectMembership } = require('../../utilities/authProjectAccess');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

const GetList = async (req, res) => {
    try {
        const projectId = toRequiredString(req.params.projectId);
        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }
        if(access.member.role !== 'owner'){
            return res.status(400).json({ message: 'User not have permission to do this action' })
        }
        const list = await WaitingList.find({ projectId: projectId });
        return res.status(200).json(
            {
                message: 'Retrieved waiting list success',
                data: list
            }
        );

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = GetList
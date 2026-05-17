const Resources = require('../../model/resources');
const {MongoServerError} = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');

const retrieve = {
    getByProjectId: async(req, res) => {
        try{
            const projectId = toRequiredString(req.params.projectId);
            const userId = toRequiredString(req.user?.id);
            if (!projectId || !userId) {
                return res.status(400).json({ message: "Project or user is invalid" });
            }
            const access = await getProjectMembership(req, projectId);
            if (!access.member) {
                return res.status(access.status).json({ message: access.message });
            }
            const resources = await Resources.find({projectId: projectId});
            return res.status(200).json(resources);
        }catch(err){
            if(err instanceof MongoServerError)
                return res.status(400).json(err)
            return res.status(500).json(err);
        }
    }
}
module.exports = retrieve;

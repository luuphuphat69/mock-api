const Resources = require('../../model/resources');
const Members = require('../../model/member');
const {MongoServerError} = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

const retrieve = {
    getByProjectId: async(req, res) => {
        try{
            const projectId = toRequiredString(req.params.projectId);
            const userId = toRequiredString(req.params.userid);
            if (!projectId || !userId) {
                return res.status(400).json({ message: "Project or user is invalid" });
            }
            const isMemberValid = await Members.exists({projectId: projectId, userId: userId});
            if(isMemberValid){
                const resources = await Resources.find({projectId: projectId});
                return res.status(200).json(resources);
            }
            return res.status(404).json({message: "Project not found"})
        }catch(err){
            if(err instanceof MongoServerError)
                return res.status(400).json(err)
            return res.status(500).json(err);
        }
    }
}
module.exports = retrieve;

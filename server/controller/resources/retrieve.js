const Project = require('../../model/projects');
const Resources = require('../../model/resources');
const Members = require('../../model/member');
const {MongoServerError} = require('mongodb');

const retrieve = {
    getByProjectId: async(req, res) => {
        try{
            const projectId = req.params.projectId;
            const userId = req.params.userid;
            const isMemberValid = await Members.exists({projectId: projectId, userId: userId});
            if(isMemberValid){
                const resources = await Resources.find({projectId: projectId});
                return res.status(200).json(resources);
            }
            return res.status(400).json({message: "You are not a member in this project"})
        }catch(err){
            if(err instanceof MongoServerError)
                return res.status(400).json(err)
            return res.status(500).json(err);
        }
    }
}
module.exports = retrieve;
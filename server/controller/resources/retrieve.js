const Project = require('../../model/projects');
const Resources = require('../../model/resources');
const {MongoServerError} = require('mongodb');
const retrieve = {
    getByProjectId: async(req, res) => {
        try{
            const projectId = req.params.projectId;
            const isProjectTrue = await Project.exists({projectId: projectId});
            if(!isProjectTrue)
                return res.status(400).json({message: 'Project is not existed'});
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
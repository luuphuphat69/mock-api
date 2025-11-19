const Resources = require('../../model/resources');
const Project = require('../../model/projects');
const { MongoServerError } = require('mongodb');

async function add(req, res){
    try{
        const projectId = req.params.projectId;
        const {name, schemaFields, records} = req.body;
        
        const isProjectExist = await Project.exists({projectId: projectId});
        if(!isProjectExist)
            return res.status(400).json({message: "Project not found"});

        const isResourceExist = await Resources.exists({name: name});
        if(isResourceExist)
            return res.status(400).json({message: "Project already have this resource"})

        const newResource = await Resources.create({
            projectId: projectId,
            name: name,
            endpoint: name.toLowerCase(),
            schemaFields: schemaFields,
            records: records
        })
        return res.status(200).json({message: "New resource added"}, newResource)
    }catch(err){
        if(err instanceof MongoServerError){
            return res.status(400).json(err)
        }
        return res.status(500).json(err);
    }
}
module.exports = add;
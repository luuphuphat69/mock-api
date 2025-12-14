const Resources = require('../../model/resources');
const Member = require('../../model/member');
const Logs = require('../../model/logs');
const { MongoServerError } = require('mongodb');
const User = require('../../model/user');

async function add(req, res) {
    try {
        const projectId = req.params.projectId;
        const userid = req.params.userid;
        const { name, schemaFields, records } = req.body;

        const memberExistInProject = await Member.findOne({ projectId: projectId, userId: userid });
        const totalResourcesOfProject = await Resources.countDocuments({projectId: projectId});
        const userInfo = await User.findOne({id: userid});
        
        if(totalResourcesOfProject === 3 && userInfo.type ==='free')
            return res.status(400).json({message: 'Maximum 3 resources for free tier'})
        
        if (!memberExistInProject)
            return res.status(400).json({ message: "Project not found" });

        if (memberExistInProject.role === 'owner' || memberExistInProject.permissions.canEdit) {

            // Clean name (trim spaces)
            const cleanedName = name.trim();

            // Create endpoint: lowercase + replace spaces with hyphens
            const endpoint = cleanedName.toLowerCase().replace(/\s+/g, "-");

            const isResourceExist = await Resources.exists({projectId: projectId ,endpoint: endpoint });
            if (isResourceExist)
                return res.status(400).json({ message: "Project already have this resource" });

            const newResource = await Resources.create({
                projectId: projectId,
                name: name,
                endpoint: endpoint,
                schemaFields: schemaFields,
                records: records
            });

            await Logs.create({
                projectId: projectId,
                userId: userid,
                resourceName: name,
                username: isMemberExistInProject.username,
                action: `Create new resource ${name}`
            })

            return res.status(200).json(
                { message: "New resource added", resource: newResource }
            );
        }
        return res.status(404).json({ message: "Project nor User not found" })

    } catch (err) {
        if (err instanceof MongoServerError) {
            return res.status(400).json(err);
        }
        return res.status(500).json(err);
    }
}

module.exports = add;
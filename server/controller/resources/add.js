const Resources = require('../../model/resources');
const Logs = require('../../model/logs');
const { MongoServerError } = require('mongodb');
const User = require('../../model/user');
const Project = require('../../model/projects');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canEdit } = require('../../utilities/authProjectAccess');
const { createProjectNotify, upsertProjectNotify } = require('../project-notify/projectNotifyService');

async function add(req, res) {
    try {
        const projectId = toRequiredString(req.params.projectId);
        const userid = toRequiredString(req.user?.id);
        const name = toRequiredString(req.body.name);
        const { schemaFields, records = [] } = req.body;

        if (!projectId || !userid || !name) {
            return res.status(400).json({ message: "Project, user or resource name is invalid" });
        }

        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        const totalResourcesOfProject = await Resources.countDocuments({projectId: projectId});
        const userInfo = await User.findOne({id: userid});
        const project = await Project.findOne({ projectId });
        const projectName = project?.name || projectId;
        
        if(totalResourcesOfProject >= 3 && userInfo?.type ==='free') {
            await upsertProjectNotify({
                projectId,
                code: '203',
                sender: userid,
                data: { project: projectName },
                metadata: {
                    userId: userid,
                    username: access.member.username,
                    projectName,
                },
            });
            return res.status(400).json({message: 'Maximum 3 resources for free tier'})
        }
        
        if(records.length > 100 && userInfo?.type === 'free') {
            await upsertProjectNotify({
                projectId,
                code: '303',
                sender: userid,
                data: {
                    resource: name,
                    project: projectName,
                },
                metadata: {
                    userId: userid,
                    username: access.member.username,
                    projectName,
                    resourceName: name,
                },
            });
            return res.status(400).json({message: 'Maximum 100 records for free tier'})
        }

        if (canEdit(access.member)) {

            // Clean name (trim spaces)
            const cleanedName = name;

            // Create endpoint: lowercase + replace spaces with hyphens
            const endpoint = cleanedName.toLowerCase().replace(/\s+/g, "-");

            const isResourceExist = await Resources.exists({projectId: projectId ,endpoint: endpoint });
            if (isResourceExist)
                return res.status(400).json({ message: "Project already have this resource" });

            const newResource = await Resources.create({
                projectId: projectId,
                name: cleanedName,
                endpoint: endpoint,
                schemaFields: schemaFields,
                records: records
            });

            await Logs.create({
                projectId: projectId,
                userId: userid,
                resourceName: cleanedName,
                username: access.member.username,
                action: `Create new resource ${cleanedName}`
            })

            await createProjectNotify({
                projectId,
                code: '300',
                sender: userid,
                data: {
                    resource: cleanedName,
                    project: projectName,
                },
                metadata: {
                    userId: userid,
                    username: access.member.username,
                    projectName,
                    resourceId: newResource._id.toString(),
                    resourceName: cleanedName,
                },
            })

            if (userInfo?.type === 'free' && totalResourcesOfProject + 1 >= 3) {
                await upsertProjectNotify({
                    projectId,
                    code: '203',
                    sender: userid,
                    data: { project: projectName },
                    metadata: {
                        userId: userid,
                        username: access.member.username,
                        projectName,
                    },
                })
            }

            if (userInfo?.type === 'free' && records.length >= 100) {
                await upsertProjectNotify({
                    projectId,
                    code: '303',
                    sender: userid,
                    data: {
                        resource: cleanedName,
                        project: projectName,
                    },
                    metadata: {
                        userId: userid,
                        username: access.member.username,
                        projectName,
                        resourceId: newResource._id.toString(),
                        resourceName: cleanedName,
                    },
                })
            }

            return res.status(201).json(
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

const Resources = require('../../model/resources');
const Logs = require('../../model/logs');
const Project = require('../../model/projects');
const User = require('../../model/user');
const { MongoServerError } = require('mongodb');
const { toObjectId, toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canEdit } = require('../../utilities/authProjectAccess');
const { createProjectNotify, upsertProjectNotify, clearProjectNotifies } = require('../project-notify/projectNotifyService');

async function edit(req, res) {
    try {
        const id = toObjectId(req.params.id);
        const userid = toRequiredString(req.user?.id);
        const projectId = toRequiredString(req.params.projectId);

        const { name, schemaFields, records } = req.body;

        if (!id || !userid || !projectId) {
            return res.status(400).json({ message: "Resource, user or project is invalid" });
        }

        const update = {};
        if (name !== undefined) {
            const normalizedName = toRequiredString(name);
            if (!normalizedName) {
                return res.status(400).json({ message: "Resource name is invalid" });
            }
            update.name = normalizedName;
        }
        if (schemaFields !== undefined) update.schemaFields = schemaFields;
        if (records !== undefined) update.records = records;

        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!canEdit(access.member)) {
            return res.status(400).json({ message: 'User not have permission to do this action' });
        }

        const userInfo = await User.findOne({ id: userid });
        const existingResource = await Resources.findOne({ _id: id, projectId });
        if (!existingResource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        const project = await Project.findOne({ projectId });
        const projectName = project?.name || projectId;
        const nextResourceName = update.name || existingResource.name;

        if (records !== undefined && records.length > 100 && userInfo?.type === 'free') {
            await upsertProjectNotify({
                projectId,
                code: '303',
                sender: userid,
                data: {
                    resource: nextResourceName,
                    project: projectName,
                },
                metadata: {
                    userId: userid,
                    username: access.member.username,
                    projectName,
                    resourceId: existingResource._id.toString(),
                    resourceName: nextResourceName,
                },
            });
            return res.status(400).json({ message: 'Maximum 100 records for free tier' });
        }

        const updatedResource = await Resources.findOneAndUpdate(
            { _id: id, projectId },
            update,
            { new: true, runValidators: true }
        );

        if (!updatedResource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        await Logs.create({
            projectId,
            userId: userid,
            username: access.member.username,
            resourceName: updatedResource.name,
            action: `Updated resource ${updatedResource.name}`
        });

        await createProjectNotify({
            projectId,
            code: '302',
            sender: userid,
            data: {
                resource: updatedResource.name,
                project: projectName,
            },
            metadata: {
                userId: userid,
                username: access.member.username,
                projectName,
                resourceId: updatedResource._id.toString(),
                resourceName: updatedResource.name,
            },
        });

        if (records !== undefined && userInfo?.type === 'free') {
            if (records.length >= 100) {
                await upsertProjectNotify({
                    projectId,
                    code: '303',
                    sender: userid,
                    data: {
                        resource: updatedResource.name,
                        project: projectName,
                    },
                    metadata: {
                        userId: userid,
                        username: access.member.username,
                        projectName,
                        resourceId: updatedResource._id.toString(),
                        resourceName: updatedResource.name,
                    },
                });
            } else {
                await clearProjectNotifies({
                    projectId,
                    code: '303',
                    metadata: { resourceId: updatedResource._id.toString() },
                });
            }
        }

        return res.status(200).json({
            message: "Resource is updated",
            resource: updatedResource
        });

    } catch (err) {
        console.error(err);
        if (err instanceof MongoServerError) {
            return res.status(400).json(err);
        }
        return res.status(500).json(err);
    }
}

module.exports = edit;

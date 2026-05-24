const Resources = require('../../model/resources');
const Logs = require('../../model/logs');
const Project = require('../../model/projects');

const { MongoServerError } = require('mongodb');
const { toObjectId, toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canDelete } = require('../../utilities/authProjectAccess');
const { createProjectNotify, clearProjectNotifies } = require('../project-notify/projectNotifyService');

async function deleteById(req, res) {
    try {
        const id = toObjectId(req.params.id); // object id of resource
        const projectid = toRequiredString(req.params.projectId);
        const requestid = toRequiredString(req.user?.id);

        if (!id || !projectid || !requestid) {
            return res.status(400).json({ message: "Resource, project or user is invalid" });
        }

        const access = await getProjectMembership(req, projectid);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (canDelete(access.member)) {

                const resource = await Resources.findOneAndDelete({ _id: id, projectId: projectid })

                if (!resource) {
                    return res.status(404).json({ message: 'Resource not found' });
                }
                
                await Logs.create({
                    projectId: projectid,
                    userId: requestid,
                    username: access.member.username,
                    action: `Delete resource ${resource.name}`
                })

                const project = await Project.findOne({ projectId: projectid });
                const projectName = project?.name || projectid;

                await createProjectNotify({
                    projectId: projectid,
                    code: '301',
                    sender: requestid,
                    data: {
                        resource: resource.name,
                        project: projectName,
                    },
                    metadata: {
                        userId: requestid,
                        username: access.member.username,
                        projectName,
                        resourceId: resource._id.toString(),
                        resourceName: resource.name,
                    },
                })

                await clearProjectNotifies({
                    projectId: projectid,
                    code: '303',
                    metadata: { resourceId: resource._id.toString() },
                })

                const remainingResourceCount = await Resources.countDocuments({ projectId: projectid });
                if (remainingResourceCount < 3) {
                    await clearProjectNotifies({ projectId: projectid, code: '203' })
                }

                return res.status(200).json({ message: 'Resource is deleted' });
        }
        return res.status(400).json({ message: 'User not have permission to do this action' })
    } catch (err) {
        console.log(err)
        if (err instanceof MongoServerError)
            return res.status(400).json(err);
        return res.status(500).json(err);
    }
}

module.exports = deleteById;

const Projects = require('../../model/projects');
const Logs = require('../../model/logs')
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canEdit } = require('../../utilities/authProjectAccess');
const { createProjectNotify } = require('../project-notify/projectNotifyService');

async function update(req, res) {
    try {
        const name = toRequiredString(req.body.name);
        const prefix = toRequiredString(req.body.prefix);
        const id = toRequiredString(req.params.id);
        const description = req.body.description || "";

        if (!name || !prefix || !id) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        if (description.length > 200)
            return res.status(400).json({ message: "Description cannot have over 200 characters" })

        const access = await getProjectMembership(req, id);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (canEdit(access.member)) {
                const updatedProject = await Projects.findOneAndUpdate(
                    { projectId: id },
                    { name, prefix, description},
                    { new: true }
                );

                if (!updatedProject)
                    return res.status(404).json({ message: "Project not found" });

                await Logs.create(
                    {
                        projectId: id,
                        userId: access.requesterId,
                        username: access.member.username,
                        action: `Updated project's name and version to: ${name} and ${prefix}`
                    }
                )

                await createProjectNotify({
                    projectId: id,
                    code: '200',
                    sender: access.requesterId,
                    data: { project: updatedProject.name },
                    metadata: {
                        userId: access.requesterId,
                        username: access.member.username,
                        projectName: updatedProject.name,
                    },
                })

                return res.status(200).json(updatedProject);
        }
        return res.status(400).json({ message: "User not have permission to do this action" });

    } catch (err) {
        return res.status(500).json(err)
    }
}
module.exports = update;

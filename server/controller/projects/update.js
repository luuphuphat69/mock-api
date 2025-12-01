const Projects = require('../../model/projects');
const Memeber = require('../../model/member');
const Logs = require('../../model/logs')

async function update(req, res) {
    try {
        const { name, prefix } = req.body;
        const id = req.params.id;
        const userId = req.params.userid;

        const getUser = await Memeber.findOne({ projectId: id, userId: userId });
        if (getUser) {
            if (getUser.role === 'owner' || getUser.permissions.canEdit) {
                const updatedProject = await Projects.findOneAndUpdate(
                    { projectId: id },
                    { name, prefix },
                    { new: true }
                );

                if (!updatedProject)
                    return res.status(404).json({ message: "Project not found" });

                await Logs.create(
                    {
                        projectId: id,
                        userId: userId,
                        username: getUser.username,
                        action: `Updated project's name and version to: ${name} and ${prefix}`
                    }
                )

                return res.status(200).json(updatedProject);
            }
            return res.status(400).json({ message: "User not have permission to do this action" });
        }
        return res.status(404).json({ message: "Not found user nor project" })

    } catch (err) {
        return res.status(500).json(err)
    }
}
module.exports = update;
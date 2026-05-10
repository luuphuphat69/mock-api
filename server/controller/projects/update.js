const Projects = require('../../model/projects');
const Memeber = require('../../model/member');
const Logs = require('../../model/logs')
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function update(req, res) {
    try {
        const name = toRequiredString(req.body.name);
        const prefix = toRequiredString(req.body.prefix);
        const id = toRequiredString(req.params.id);
        const userId = toRequiredString(req.params.userid);
        const description = req.body.description

        if (!name || !prefix || !id || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        if (description.length > 200)
            return res.status(400).json({ message: "Description cannot have over 200 characters" })

        const getUser = await Memeber.findOne({ projectId: id, userId: userId });
        if (getUser) {
            if (getUser.role === 'owner' || getUser.permissions.canEdit) {
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

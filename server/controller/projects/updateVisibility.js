const Projects = require('../../model/projects');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canEdit } = require('../../utilities/authProjectAccess');

const updateVisibility = async (req, res) => {
    try {
        const projectId = toRequiredString(req.params.projectId);
        const { isPublic } = req.body;

        if (!projectId || typeof isPublic !== 'boolean') {
            return res.status(400).json({ message: "Missing or invalid required fields" });
        }

        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (canEdit(access.member)) {
            const updatedProject = await Projects.findOneAndUpdate(
                { projectId: projectId },
                { isPublic },
                { new: true }
            );

            if (!updatedProject) {
                return res.status(404).json({ message: "Project not found" });
            }

            return res.status(200).json(updatedProject);
        }

        return res.status(400).json({ message: "User does not have permission to do this action" });

    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = updateVisibility;

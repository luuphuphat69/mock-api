const Projects = require('../../model/projects');

async function update(req, res) {
    try {
        const { name, prefix } = req.body;
        const id = req.params.id;

        const updatedProject = await Projects.findOneAndUpdate(
            { projectId: id },
            { name, prefix },
            { new: true }
        );
        if (!updatedProject)
            return res.status(404).json({ message: "Project not found" });
        return res.status(200).json(updatedProject);
    } catch (err) {
        return res.status(500).json(err)
    }
}
module.exports = update;
const Project = require('../../model/projects');
const { MongoServerError } = require('mongodb');

async function deletePrj(req, res) {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: "Bad request: missing id" });

        const result = await Project.deleteOne({ projectId: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        if (err instanceof MongoServerError) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error", err });
    }
}

module.exports = deletePrj;

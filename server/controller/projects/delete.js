const Project = require('../../model/projects');
const Member = require('../../model/member');
const Resources = require('../../model/resources');
const Logs = require('../../model/logs');
const { MongoServerError } = require('mongodb');

async function deletePrj(req, res) {
    try {
        const id = req.params.id;
        const userId = req.params.userid;

        if (!id)
            return res.status(400).json({ message: "Bad request: missing id" });
        if (!userId)
            return res.status(400).json({ message: "Bad request: missing userID" });

        const getUser = await Member.findOne({ projectId: id, userId: userId })
        if (getUser) {
            if (getUser.role === 'owner') {
                
                const result = await Project.deleteOne({ projectId: id, userId: userId });

                await Member.deleteMany({ projectId: id });
                await Resources.deleteMany({ projectId: id });
                await Logs.deleteMany({projectId: id});

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "Project not found" });
                }

                return res.status(200).json({ message: "Project deleted successfully" });
            }
            return res.status(400).json({message: "User not have permission to do this action"});
        }
        return res.status(404).json({message: "Not found user nor project"})
    } catch (err) {
        if (err instanceof MongoServerError) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error", err });
    }
}

module.exports = deletePrj;

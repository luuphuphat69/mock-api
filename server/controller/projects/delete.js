const Project = require('../../model/projects');
const Member = require('../../model/member');
const Resources = require('../../model/resources');
const Logs = require('../../model/logs');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');

async function deletePrj(req, res) {
    try {
        const id = toRequiredString(req.params.id);

        if (!id)
            return res.status(400).json({ message: "Bad request: missing id" });

        const access = await getProjectMembership(req, id);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }

        if (access.member.role === 'owner') {
                
                const result = await Project.deleteOne({ projectId: id });

                await Member.deleteMany({ projectId: id });
                await Resources.deleteMany({ projectId: id });
                await Logs.deleteMany({projectId: id});

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: "Project not found" });
                }

                return res.status(200).json({ message: "Project deleted successfully" });
        }
        return res.status(400).json({message: "User not have permission to do this action"});
    } catch (err) {
        if (err instanceof MongoServerError) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error", err });
    }
}

module.exports = deletePrj;

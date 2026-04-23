const { MongoServerError } = require('mongodb');
const Project = require('../../model/projects');
const User = require('../../model/user');
const Members = require('../../model/member');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const retrieve = {
    getByUserID: async (req, res) => {
        try {
            const userId = toRequiredString(req.params.userID);
            if (!userId) {
                return res.status(400).json({ message: "User not found" });
            }
            const user = await User.exists({ id: userId });
            if (!user)
                return res.status(404).json({ message: "User not found" });

            const projects = await Project.find({ userId });
            return res.status(200).json(projects);

        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err })
            return res.status(500).json({ message: err });
        }
    },

    getById: async (req, res) => {
        try {
            const id = toRequiredString(req.params.id)
            if (!id) {
                return res.status(400).json({ message: "Project not found" });
            }
            const project = await Project.findOne({ projectId: id});
            return res.status(200).json(project);
        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err })
            return res.status(500).json({ message: err });
        }
    },

    getAll: async (req, res) => {
        try {
            const projects = await Project.find();
            return res.status(200).json(projects);
        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err });
            return res.status(500).json({ message: err });
        }
    },
    
    getProjectAsMemberAndGuest: async (req, res) => {
        try {
            const userId = toRequiredString(req.params.userid);

            if (!userId) {
                return res.status(400).json({ error: "User is invalid" });
            }

            const memberships = await Members.find({
                userId: userId,
                role: { $in: ['member', 'guest'] }
            }).select('projectId role');

            if (memberships.length === 0) {
                return res.json([]);
            }

            // Fetch full project data for each project
            const projectIds = memberships.map(m => m.projectId);

            const projects = await Project.find({projectId: { $in: projectIds } });

            // Merge project data
            const result = projects.map(project => {
                return {
                    ...project.toObject(),
                };
            });
            return res.status(200).json(result);

        } catch (err) {
            console.error("Error fetching member projects:", err);
            res.status(500).json({ error: "Server error" });
        }
    }
}
module.exports = retrieve;

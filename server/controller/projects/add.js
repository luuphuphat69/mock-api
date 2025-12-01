const Projects = require('../../model/projects');
const User = require('../../model/user');
const Memeber = require('../../model/member');
const { MongoServerError } = require('mongodb');
const { v4: uuidv4 } = require("uuid");
const Logs = require('../../model/logs');
async function Add(req, res) {

    const { userId, name, prefix } = req.body;

    try {
        const user = await User.findOne({ id: userId });

        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.type === "free") {
            const count = await Projects.countDocuments({ userId });

            if (count >= 5) {
                return res.status(403).json({
                    message: "Free plan limit reached: You can only create up to 5 projects."
                });
            }
        }

        let projectId = uuidv4();

        const newProject = await Projects.create({
            projectId,
            userId,
            name,
            prefix,
        });

        await Memeber.create({
            projectId,
            userId,
            username: user.name,
            role: 'owner',
            permissions:{
                canEdit: true,
                canDelete: true,
                canInvite: true
            }
        })

        await Logs.create({
            projectId: projectId,
            userId: userId,
            username: user.name,
            action: `Create new project ${name}`
        })

        return res.status(201).json({
            message: "Project created successfully.",
            newProject
        });

    } catch (err) {
        console.error("Error creating project:", err);

        // Handle Mongoose/MongoDB Duplicate Key Error (E11000)
        if (err instanceof MongoServerError && err.code === 11000) {
            if (err.keyPattern && err.keyPattern.apiKey === 1) {
                // This shouldn't happen with crypto.randomBytes, but good to check
                return res.status(500).json({ message: "Server error: Generated API Key collision." });
            }else{
                return res.status(500).json({message: err})
            }
        }
        // Handle Mongoose Validation Error (e.g., missing required field)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed: " + err.message });
        }

        return res.status(500).json({ message: "Internal server error. Could not create project." });
    }
}

module.exports = Add;
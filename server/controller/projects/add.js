const Projects = require('../../model/projects');
const { MongoServerError } = require('mongodb');

async function Add(req, res) {

    const { userId, name, prefix } = req.body;

    try {

        const newProject = await Projects.create({
            userId,
            name,
            prefix,
        });

        return res.status(201).json({
            message: "Project created successfully.",
            projectId: newProject._id,
        });

    } catch (err) {
        console.error("Error creating project:", err);

        // Handle Mongoose/MongoDB Duplicate Key Error (E11000)
        if (err instanceof MongoServerError && err.code === 11000) {
            // Check if the duplicate error is specifically for the 'prefix' field
            if (err.keyPattern && err.keyPattern.prefix === 1) {
                return res.status(400).json({ message: "Error: This project prefix is already in use." });
            }
            else if (err.keyPattern && err.keyPattern.apiKey === 1) {
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
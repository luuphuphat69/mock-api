const Project = require('../model/projects');
const bcrypt = require('bcryptjs');

const authKey = async (rawKey, projectId) => {
    try {
        if (!rawKey || !projectId) {
            return false;
        }

        const project = await Project.findOne({ projectId })
            .select('+apiKey');

        if (!project || !project.apiKey) {
            return false;
        }

        const isKeyValid = await bcrypt.compare(
            rawKey,
            project.apiKey
        );

        return isKeyValid;
    } catch (err) {
        console.error('API key auth error:', err);
        return false;
    }
};

module.exports = authKey;
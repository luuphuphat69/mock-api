const Resources = require('../../model/resources');
const Member = require('../../model/member');
const Logs = require('../../model/logs');
const { MongoServerError } = require('mongodb');

async function edit(req, res) {
    try {
        const id = req.params.id;
        const userid = req.params.userid;
        const projectId = req.params.projectId;

        const { name, schemaFields, records } = req.body;

        const update = {};
        if (name !== undefined) update.name = name;
        if (schemaFields !== undefined) update.schemaFields = schemaFields;
        if (records !== undefined) update.records = records;

        const getUser = await Member.findOne({ projectId, userId: userid });

        if (!getUser) {
            return res.status(400).json({ message: 'Not found user nor project' });
        }

        if (!(getUser.role === 'owner' || getUser.permissions?.canEdit)) {
            return res.status(400).json({ message: 'User not have permission to do this action' });
        }

        const updatedResource = await Resources.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        );

        if (!updatedResource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        await Logs.create({
            projectId,
            userId: userid,
            username: getUser.username,
            resourceName: updatedResource.name,
            action: `Updated resource ${updatedResource.name}`
        });

        return res.status(200).json({
            message: "Resource is updated",
            resource: updatedResource
        });

    } catch (err) {
        console.error(err);
        if (err instanceof MongoServerError) {
            return res.status(400).json(err);
        }
        return res.status(500).json(err);
    }
}

module.exports = edit;
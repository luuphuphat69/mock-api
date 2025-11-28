const Resources = require('../../model/resources');
const { MongoServerError } = require('mongodb');
const Member = require('../../model/member')

async function edit(req, res) {
    try {
        const id = req.params.id; // object id of resource
        const userid = req.params.userid;
        const projectId = req.params.projecId;

        const { name, schemaFields, records } = req.body;

        const update = {};
        if (name !== undefined) update.name = name;
        if (schemaFields !== undefined) update.schemaFields = schemaFields;
        if (records !== undefined) update.records = records;

        const getUser = await Member.findOne({ projectId: projectId, userId: userid });
        if (getUser) {
            if (getUser.role === 'owner' | getUser.permissions.canEdit) {
                const resource = await Resources.findByIdAndUpdate(id, update, { new: true });

                return res.status(200).json({
                    message: "Resource is updated",
                    resource
                });
            }
            return res.status(400).json({ message: 'User not have permission to do this action' });
        }
        return res.status(400).json({ message: 'Not found user nor project' })

    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json(err);

        return res.status(500).json(err);
    }
}

module.exports = edit;
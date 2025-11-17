const Resources = require('../../model/resources');
const { MongoServerError } = require('mongodb');
const mongoose = require("mongoose");

async function edit(req, res) {
    try {
        const id = req.params.id;
        const { name, schemaFields, records } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid resource ID format" });
        }

        const update = {};
        if (name !== undefined) update.name = name;
        if (schemaFields !== undefined) update.schemaFields = schemaFields;
        if (records !== undefined) update.records = records;

        const resource = await Resources.findByIdAndUpdate(id, update, { new: true });

        return res.status(200).json({
            message: "Resource is updated",
            resource
        });

    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json(err);

        return res.status(500).json(err);
    }
}

module.exports = edit;
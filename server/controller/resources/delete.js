const Resources = require('../../model/resources');
const { MongoServerError } = require('mongodb');
const mongoose = require("mongoose");

async function deleteById(req, res) {
    try {
        const id = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid resource ID format" });
        }

        const deleted = await Resources.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        return res.status(200).json({ message: 'Resource is deleted' });

    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json(err);

        return res.status(500).json(err);
    }
}

module.exports = deleteById;

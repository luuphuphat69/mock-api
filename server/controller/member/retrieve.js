const Member = require('../../model/member');
const {MongoServerError} = require('mongodb');

async function getMemberByProject(req, res) {
    try {
        const projectId = req.params.id;

        if (!projectId)
            return res.status(400).json({ message: "Project is invalid" });

        const members = await Member.find({ projectId });
        return res.status(200).json(members);
    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json(err)
        return res.status(500).json(err);
    }
}
module.exports = getMemberByProject
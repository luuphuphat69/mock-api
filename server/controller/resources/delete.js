const Resources = require('../../model/resources');
const Memeber = require('../../model/member');
const { MongoServerError } = require('mongodb');

async function deleteById(req, res) {
    try {
        const id = req.params.id; // object id of resource
        const projectid = req.params.projectId;
        const userid = req.params.userid;

        const getUser = await Memeber.findOne({ projectId: projectid, userId: userid });
        if (getUser) {
            if (getUser.role === 'owner' | getUser.permissions.canDelete) {
                const deleted = await Resources.findByIdAndDelete(id);

                if (!deleted) {
                    return res.status(404).json({ message: 'Resource not found' });
                }
                return res.status(200).json({ message: 'Resource is deleted' });
            }
            return res.status(400).json({ message: 'User not have permission to do this action' })
        }
        return res.status(404).json({message: 'Not found user nor project'})
    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json(err);

        return res.status(500).json(err);
    }
}

module.exports = deleteById;

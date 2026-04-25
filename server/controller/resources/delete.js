const Resources = require('../../model/resources');
const Memeber = require('../../model/member');
const Logs = require('../../model/logs');

const { MongoServerError } = require('mongodb');
const { toObjectId, toRequiredString } = require('../../utilities/sanitizeRequestData');

async function deleteById(req, res) {
    try {
        const id = toObjectId(req.params.id); // object id of resource
        const projectid = toRequiredString(req.params.projectId);
        const requestid = toRequiredString(req.params.userid);

        if (!id || !projectid || !requestid) {
            return res.status(400).json({ message: "Resource, project or user is invalid" });
        }

        const getUser = await Memeber.findOne({ projectId: projectid, userId: requestid});
        if (getUser) {
            if (getUser.role === 'owner' || getUser.permissions.canDelete) {

                const resource = await Resources.findByIdAndDelete(id)

                if (!resource) {
                    return res.status(404).json({ message: 'Resource not found' });
                }
                
                await Logs.create({
                    projectId: projectid,
                    userId: requestid,
                    username: getUser.username,
                    action: `Delete resource ${resource.name}`
                })
                return res.status(200).json({ message: 'Resource is deleted' });
            }
            return res.status(400).json({ message: 'User not have permission to do this action' })
        }
        return res.status(404).json({message: 'Not found user nor project'})
    } catch (err) {
        console.log(err)
        if (err instanceof MongoServerError)
            return res.status(400).json(err);
        return res.status(500).json(err);
    }
}

module.exports = deleteById;

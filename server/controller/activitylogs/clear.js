const Logs = require('../../model/logs')
const {MongoServerError} = require('mongodb');
const Members = require('../../model/member');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function clearLogs(req, res){
    try{
        const projectid = toRequiredString(req.params.projectid);
        const requesterid = toRequiredString(req.params.requestid);

        if (!projectid || !requesterid) {
            return res.status(400).json({ message: "Project or requester is invalid" });
        }

        const isRequesterValid = await Members.findOne({projectId: projectid, userId: requesterid});

        if (!isRequesterValid) {
            return res.status(404).json({ message: "Not found user nor project" });
        }
        
        if(isRequesterValid.role === 'owner' || isRequesterValid.permissions.canDelete){
            await Logs.deleteMany({projectId: projectid});
            return res.status(200).json({message: "Logs clear"})
        }
        return res.status(400).json({message: "User not have permission to clear logs"})
    }catch(err){
        if(err instanceof MongoServerError)
            return res.status(400).json(err)
        return res.status(500).json(err)
    }
}
module.exports = clearLogs

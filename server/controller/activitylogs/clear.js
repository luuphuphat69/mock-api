const Logs = require('../../model/logs')
const {MongoServerError} = require('mongodb');
const Members = require('../../model/member');

async function clearLogs(req, res){
    try{
        const projectid = req.params.projectid;
        const requesterid = req.params.requestid;
        const isRequesterValid = await Members.findOne({projectId: projectid, userId: requesterid});
        
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
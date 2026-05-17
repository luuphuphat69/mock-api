const Logs = require('../../model/logs');
const {MongoServerError} = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership } = require('../../utilities/authProjectAccess');

async function getLogs(req, res){
    try{
        const projectid = toRequiredString(req.params.projectid);
        if(!projectid)
            return res.status(400).json({message: "Project is invalid"})
        const access = await getProjectMembership(req, projectid);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }
        const logs = await Logs.find({projectId: projectid});
        return res.status(200).json(logs);
    }catch(err){
        console.log(err);
        if(err instanceof MongoServerError)
            return res.status(400).json(err)
        return res.status(500).json(err);
    }
}
module.exports = getLogs

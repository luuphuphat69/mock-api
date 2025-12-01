const Logs = require('../../model/logs')
const {MongoServerError} = require('mongodb');

async function clearLogs(req, res){
    try{
        const projectid = req.params.projectid;
        await Logs.deleteMany({projectId: projectid});
        return res.status(200).json({message: "Logs clear"})
    }catch(err){
        if(err instanceof MongoServerError)
            return res.status(400).json(err)
        return res.status(500).json(err)
    }
}
module.exports = clearLogs
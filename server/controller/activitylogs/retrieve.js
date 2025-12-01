const Logs = require('../../model/logs');
const {MongoServerError} = require('mongodb');

async function getLogs(req, res){
    try{
        const projectid = req.params.projectid;
        if(!projectid)
            return res.status(400).json({message: "Project is invalid"})
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
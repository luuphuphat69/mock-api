const MockLogs = require('../../model/mock_logs')
const {MongoServerError} = require('mongodb')
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
async function getMethodsMetric(req, res){
    try{
        const projectId = toRequiredString(req.params.projectId);
        const method = toRequiredString(req.query.method);

        if(!projectId)
            return res.status(400).json({messsage: "Project not found"})

        if (!method)
            return res.status(400).json({message: "Method not allowed"})
        
        if(!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()))
            return res.status(400).json({message: "Method not allowed"})

        const listRequest = await MockLogs.find({projectId: projectId, method: method.toUpperCase()});
        const totalSuccessRequest = listRequest.filter(r => r.success === true).length;
        const totalFailedRequest = listRequest.length - totalSuccessRequest
        const successRate = (totalSuccessRequest / listRequest.length) || 0

        return res.status(200).json({
            totalRequest: listRequest.length,
            successRate,
            totalFailedRequest
        })
    }catch(err){
        if(err instanceof MongoServerError)
            return res.status(400).json(err);
        return res.status(500).json(err);
    }
}
module.exports = getMethodsMetric;

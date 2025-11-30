const Member = require('../../model/member');
const {MongoServerError} = require('mongodb');
async function removeMember (req, res){
    try{
        const userid = req.params.userid;
        const projectid = req.params.projectid;

        if(!userid || !projectid)
            return res.status(400);

        const member = await Member.findOne({projectId: projectid, userId: userid})
        if(member.role === 'owner'){
            return res.status(404).json({message: `Cannot remove project's owner`})
        }
        await Member.deleteOne(member)
        return res.status(200).json({message: 'Member is removed'})
    }catch(err){
        if(err instanceof MongoServerError)
            return res.status(404).json(err)
        return res.status(500).json(err);
    }
}
module.exports = removeMember;
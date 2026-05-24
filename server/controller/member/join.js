const Member = require('../../model/member')
const Project = require('../../model/projects')
const {toRequiredString} = require('../../utilities/sanitizeRequestData')
const bcrypt = require('bcryptjs')
const { createProjectNotify, clearProjectNotifies } = require('../project-notify/projectNotifyService')

const joinProject = async(req, res) => {
    try {
        const rawAccessKey = toRequiredString(req.body.accessKey)
        const projectId = toRequiredString(req.params.projectId);
        const userId = toRequiredString(req.user.id);

        if(!rawAccessKey || !projectId || !userId)
            return res.status(400).json({message: 'Missing required fields'});

        const project = await Project.findOne({projectId}).select('+accessKey')
        const isMemberJoined = await Member.findOne({projectId, userId});
        const isValidKey = await bcrypt.compare(rawAccessKey, project.accessKey)
      
        if(isMemberJoined)
            return res.status(400).json({message: 'Member has joined the project'})    
        if(!isValidKey)
            return res.status(400).json({message: 'Invalid key'});
    
        await Member.create({
            projectId,
            userId,
            username: req.user.name,
            role: 'guest',
        })

        await createProjectNotify({
            projectId,
            code: '100',
            sender: userId,
            data: {
                user: req.user.name,
                project: project.name,
            },
            metadata: {
                userId,
                username: req.user.name,
                projectName: project.name,
            },
        })

        await clearProjectNotifies({
            projectId,
            code: '104',
            metadata: { userId },
        })

        return res.status(200).json({messasge: 'User has joined in the project !'})
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}
module.exports = joinProject

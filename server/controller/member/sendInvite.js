const Members = require('../../model/member');
const axios = require('axios');

async function sendInvite(req, res) {
    try {
        const inviterId = req.params.inviterId;
        const projectId = req.params.projectId;
        const payload = req.body;

        const member = await Members.findOne({ projectId: projectId, userId: inviterId });
        if (member.permissions.canInvite || member.role === 'owner') {
            await axios.post(
                "https://6q3ponujge.execute-api.us-east-1.amazonaws.com/default/send-invite",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }

            );
            return res.status(200).json({ message: "Invitation sent" })
        }
        return res.status(400).json({ message: "User not have permission to invite" })
    } catch (err) {
        return res.status(500).json(err)
    }
}
module.exports = sendInvite
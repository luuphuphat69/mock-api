const Members = require('../../model/member');
const axios = require('axios');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function sendInvite(req, res) {
    try {
        const inviterId = toRequiredString(req.params.inviterId);
        const projectId = toRequiredString(req.params.projectId);
        const payload = req.body;

        if (!inviterId || !projectId) {
            return res.status(400).json({ message: "Inviter or project is invalid" });
        }

        const member = await Members.findOne({ projectId: projectId, userId: inviterId });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
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

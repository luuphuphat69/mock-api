const axios = require('axios');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');
const { getProjectMembership, canInvite } = require('../../utilities/authProjectAccess');

async function sendInvite(req, res) {
    try {
        const projectId = toRequiredString(req.params.projectId);
        const payload = req.body;

        if (!projectId) {
            return res.status(400).json({ message: "Inviter or project is invalid" });
        }

        const access = await getProjectMembership(req, projectId);
        if (!access.member) {
            return res.status(access.status).json({ message: access.message });
        }
        if (canInvite(access.member)) {
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

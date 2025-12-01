const Members = require('../../model/member');
const { MongoServerError } = require('mongodb');

async function changeRole(req, res) {
    try {
        const requesterId = req.params.requesterid;
        const userId = req.params.userid;
        const projectId = req.params.projectid;
        const { role } = req.body;

        if (!role || !["owner", "member", "guest"].includes(role)) {
            return res.status(400).json({ message: "Invalid role value" });
        }

        // Check requester exists in project
        const requester = await Members.findOne({ userId: requesterId, projectId });

        if (!requester) {
            return res.status(400).json({ message: "Requester not in this project" });
        }

        // ONLY OWNER ALLOWED TO CHANGE ROLES
        if (requester.role !== "owner") {
            return res.status(403).json({ message: "User not have permission to change role" });
        }

        // Check target user exists
        const targetUser = await Members.findOne({ userId, projectId });

        if (!targetUser) {
            return res.status(400).json({ message: "Target user not in this project" });
        }

        // If demoting an owner → ensure at least 1 owner remains
        if (targetUser.role === "owner" && role !== "owner") {
            const ownerCount = await Members.countDocuments({ projectId, role: "owner" });

            if (ownerCount <= 1) {
                return res.status(400).json({
                    message: "Cannot demote last owner of project"
                });
            }
        }

        // 🔥 Assign permissions automatically based on role
        let permissions = {
            canEdit: false,
            canDelete: false,
            canInvite: false
        };

        if (role === "owner") {
            permissions = {
                canEdit: true,
                canDelete: true,
                canInvite: true
            };
        } else if (role === "member") {
            permissions = {
                canEdit: true,
                canDelete: false,
                canInvite: true
            };
        } else if (role === "guest") {
            permissions = {
                canEdit: false,
                canDelete: false,
                canInvite: false
            };
        }

        // Apply update
        const updated = await Members.findOneAndUpdate(
            { userId, projectId },
            { role, permissions },
            { new: true }
        );

        return res.status(200).json({
            message: "Member updated",
            updated
        });

    } catch (err) {
        if (err instanceof MongoServerError)
            return res.status(400).json(err);

        return res.status(500).json(err);
    }
}

module.exports = changeRole;
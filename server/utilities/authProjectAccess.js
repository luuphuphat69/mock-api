const Members = require('../model/member');
const { toRequiredString } = require('./sanitizeRequestData');

function getAuthenticatedUserId(req) {
    return toRequiredString(req.user?.id);
}

async function getProjectMembership(req, projectId) {
    const requesterId = getAuthenticatedUserId(req);

    if (!requesterId) {
        return { status: 401, message: "Unauthorized" };
    }

    const member = await Members.findOne({ projectId, userId: requesterId });

    if (!member) {
        return { status: 404, message: "Not found user nor project" };
    }

    return { requesterId, member };
}

function canEdit(member) {
    return member.role === 'owner' || Boolean(member.permissions?.canEdit);
}

function canDelete(member) {
    return member.role === 'owner' || Boolean(member.permissions?.canDelete);
}

function canInvite(member) {
    return member.role === 'owner' || Boolean(member.permissions?.canInvite);
}

module.exports = {
    getAuthenticatedUserId,
    getProjectMembership,
    canEdit,
    canDelete,
    canInvite
};

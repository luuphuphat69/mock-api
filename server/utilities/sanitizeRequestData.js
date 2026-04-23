const { Types } = require("mongoose");

function toTrimmedString(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function toRequiredString(value) {
    const normalized = toTrimmedString(value);
    return normalized.length > 0 ? normalized : null;
}

function toObjectId(value) {
    const normalized = toRequiredString(value);

    if (!normalized || !Types.ObjectId.isValid(normalized)) {
        return null;
    }

    return normalized;
}

function toInteger(value) {
    const normalized = toRequiredString(value);

    if (!normalized) {
        return null;
    }

    const parsed = Number.parseInt(normalized, 10);
    return Number.isInteger(parsed) ? parsed : null;
}

module.exports = {
    toTrimmedString,
    toRequiredString,
    toObjectId,
    toInteger
};

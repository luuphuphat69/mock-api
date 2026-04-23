function isValidEmail(email) {
    if (typeof email !== "string") return false;

    const normalized = email.trim().toLowerCase();

    // Basic but safe regex (covers most real-world cases)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(normalized);
}

function normalizeEmail(email) {
    if (typeof email !== "string") return "";

    return email.trim().toLowerCase();
}

module.exports = {
    isValidEmail,
    normalizeEmail
};
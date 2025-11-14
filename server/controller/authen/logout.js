async function logout(req, res) {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    return res.status(200).json({ message: 'Logged out' });
}
module.exports = logout;
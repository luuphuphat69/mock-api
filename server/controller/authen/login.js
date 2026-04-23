const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../model/user');
const { isValidEmail, normalizeEmail } = require('../../utilities/validateEmail');

async function login(req, res) {
    try {
        const rawEmail = req.body.email;
        const password = String(req.body.password || "");

        if (!isValidEmail(rawEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const email = normalizeEmail(rawEmail);
        const account = await User.findOne({
            email: { $eq: email }
        });

        const cfTurnstileToken = req.body.cfToken
        if (process.env.NODE_ENV === 'production') {
            const verifyCfTurnstile = await fetch(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `secret=${process.env.CF_TURNSTILE_TOKEN}&response=${cfTurnstileToken}`
                }
            );

            let cfData = await verifyCfTurnstile.json();

            if (!cfData.success) {
                return res.status(403).json({ message: "Verification failed" });
            }
        }

        if (!account)
            return res.status(400).json({ message: "Account is not exist" });

        const isPasswordCorrect = await bcrypt.compare(password, account.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }

        const userPayload = {
            id: account.id,
            name: account.name,
            email: account.email,
            type: account.type
        }

        const token = jwt.sign(userPayload, process.env.PRIVATE_KEY, { expiresIn: '2h' });
        res.cookie('token', token, {
            maxAge: 2 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none",
            partitioned: true,
            path: "/",
        });

        return res.status(200).json({
            message: "Login succesfully",
            token: token
        });
    } catch (err) {
        return res.status(500).json({ message: err })
    }
}
module.exports = login;
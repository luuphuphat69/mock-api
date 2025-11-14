const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../model/user');

async function login(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const account = await User.findOne({ email });
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
            secure: false,
            sameSite: 'lax'
        })
        return res.status(200).json({ message: "Login succesfully" });
    } catch (err) {
        return res.status(500).json({ message: err })
    }
}
module.exports = login;
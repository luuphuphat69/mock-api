const Users = require('../../model/user');
const bcrypt = require('bcryptjs');

async function ChangePassword(req, res) {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find user
        const user = await Users.findOne({id: userId}).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // No restrictions — user can use 1 char password
        const hashed = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashed;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (err) {
        console.error("ChangePassword error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = ChangePassword;
const User = require('../../model/user');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

const updateUser = async (req, res) => {
    const name = req.body.username;
    const id = toRequiredString(req.user?.id);

    if (!id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const update = {};
    if (name !== undefined) {
        const normalizedName = toRequiredString(name);
        if (!normalizedName) {
            return res.status(400).json({ message: "Name is invalid" });
        }
        update.name = normalizedName;
    }

    const updatedUser = await User.findOneAndUpdate({'id': id}, update, { new: true, runValidators: true })
    return res.status(200).json({
        message: "User is updated",
        updated: updatedUser
    });
}
module.exports = updateUser

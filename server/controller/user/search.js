const { MongoServerError } = require('mongodb');
const User = require('../../model/user');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function Search(req, res) {
    try {
        const searchString = toRequiredString(req.query.user);

        if (!searchString) {
            return res.status(400).json({ message: "Search value is invalid" });
        }

        const results = await User.aggregate([
            {
                $search: {
                    index: "default",
                    autocomplete: {
                        query: searchString,
                        path: "name",
                        fuzzy: { maxEdits: 1 }
                    }
                }
            },
            {
                $project: {
                    id: 1,
                    name: 1,
                    email: 1,
                }
            },
            { $limit: 10 }
        ]);
        return res.status(200).json(results);
    } catch (err) {
        if (err instanceof MongoServerError) {
            return res.status(400).json(err);
        }
        return res.status(500).json({ message: "Unknown server error" });
    }
}

module.exports = Search;

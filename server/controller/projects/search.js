const Project = require('../../model/projects');
const { MongoServerError } = require('mongodb');
const { toRequiredString } = require('../../utilities/sanitizeRequestData');

async function Search(req, res) {
    try {
        const query = req.query.project
        const searchString = toRequiredString(query);

        if (!searchString) {
            return res.status(400).json({
                message: "Search value is invalid"
            });
        }

        const results = await Project.aggregate([
            {
                $search: {
                    index: "default",
                    compound: {
                        should: [
                            {
                                autocomplete: {
                                    query: searchString,
                                    path: "name",
                                    fuzzy: {
                                        maxEdits: 1
                                    }
                                }
                            },
                            {
                                autocomplete: {
                                    query: searchString,
                                    path: "projectId",
                                    fuzzy: {
                                        maxEdits: 1
                                    }
                                }
                            }
                        ],
                        minimumShouldMatch: 1,
                        filter: [
                            {
                                equals: {
                                    value: true,
                                    path: "isPublic"
                                }
                            }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    projectId: 1,
                    name: 1,
                    prefix: 1,
                    description: 1,
                    score: { $meta: "searchScore" }
                }
            },
            {
                $limit: 20
            }
        ]);
        return res.status(200).json(results);

    } catch (err) {
        console.error(err);

        if (err instanceof MongoServerError) {
            return res.status(400).json(err);
        }

        return res.status(500).json({
            message: "Unknown server error"
        });
    }
}

module.exports = Search;
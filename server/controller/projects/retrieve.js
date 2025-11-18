const { MongoServerError } = require('mongodb');
const Project = require('../../model/projects');
const User = require('../../model/user');
const retrieve = {
    getByUserID: async (req, res) => {
        try {
            const userId = req.params.userID;
            const user = await User.exists({ id: userId });
            if (!user)
                return res.status(404).json({ message: "User not found" });

            const projects = await Project.find({ userId });
            return res.status(200).json(projects);

        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err })
            return res.status(500).json({ message: err });
        }
    },

    getByName: async (req, res) => {
        try {
            const name = req.params.name
            const projects = new Project.find({ name });
            return res.status(200).json(projects);
        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err })
            return res.status(500).json({ message: err });
        }
    },

    getAll: async (req, res) => {
        try {
            const projects = await Project.find();
            return res.status(200).json(projects);
        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err });
            return res.status(500).json({ message: err });
        }
    },
    getKey: async(req, res) => {
        try{
            const projectId = req.params.id;
            const keyOnly = await Project.findOne({ projectId }).select('+apiKey');
            return res.status(200).json(keyOnly);
        }catch(err){
            if(err instanceof MongoServerError)
                return res.status(400).json({message: err});
            return res.status(500).json({message: err});
        }
    }
}
module.exports = retrieve;
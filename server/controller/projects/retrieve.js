const { MongoServerError } = require('mongodb');
const Project = require('../../model/projects');
const retrieve = {
    getByUserID: async (req, res) => {
        try {
            const userId = req.params.userID;
            if (!userId)
                return res.status(400).json({ message: "Invalid User ID" });

            const projects = await Project.find({ userId });
            return res.status(200).json(projects);

        } catch (err) {
            if (err instanceof MongoServerError)
                return res.status(400).json({ message: err })
            return res.status(500).json({ message: err });
        }
    },

    getByName: async(req, res) => {
        try{
            const name = req.params.name
            const projects = new Project.find({name});
            return res.status(200).json(projects);
        }catch(err){
            if(err instanceof MongoServerError)
                return res.status(400).json({message: err})
            return res.status(500).json({message: err});
        }
    },

    getAll: async(req, res) => {
        try{
            const projects = await Project.find();
            return res.status(200).json(projects);
        }catch(err){
            if(err instanceof MongoServerError)
                return res.status(400).json({message: err});
            return res.status(500).json({message: err});
        }
    }
}
module.exports = retrieve;
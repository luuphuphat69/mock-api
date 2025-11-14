const User = require('../../model/user');
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const { MongoServerError } = require('mongodb');
const saltRounds = 10;

async function register(req, res) {

    try {
        const { email, password, name } = req.body;

        const hashPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            id: uuidv4(),
            name: name,
            email: email,
            password: hashPassword,
        });
        
        return res.status(201).json({ 
            message: "User created successfully",
            userId: newUser._id 
        });

    } catch (err) {
        if (err instanceof MongoServerError && err.code === 11000) {
            if (err.keyPattern && err.keyPattern.email === 1) {
                return res.status(400).json({ message: "Error: This email is already registered." });
            }
        }
        
        if (err.name === 'ValidationError') {
            // Return a 400 Bad Request with the validation details
            return res.status(400).json({ message: "Validation failed: " + err.message });
        }

        return res.status(500).json({ message: "Internal server error. Registration failed." })
    }
}
module.exports = register;
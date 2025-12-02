const User = require('../../model/user');
const axios = require('axios');
const {MongoServerError} = require('mongodb');

async function ResetPassword(req, res){
    try{
        const email = req.query.email;
        const isUserExisted = await User.exists({email: email});
        if(!isUserExisted)
            return res.status(400).json({message: "User not existed"});

        await axios.post(`https://agssmi0f81.execute-api.us-east-1.amazonaws.com/default/send-request-reset-password?email=${email}`);
        return res.status(200).json("Reset email is sent");
    }catch(err){
        if(err instanceof MongoServerError)
            return res.status(400).json(err);
        return res.status(500).json(err);
    }
}
module.exports = ResetPassword;
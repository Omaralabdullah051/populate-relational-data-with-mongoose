const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userSchema = require('../schemas/userSchema');
const checkLogin = require('../middlewares/checkLogin');
const User = new mongoose.model("User", userSchema);

//*SIGNUP
router.post('/signup', async (req, res) => {
    try {
        //here we encrypted the user password and then store it on our DB to secure the pass.
        //note: here we take password to complete the authentication system. Not for JWT token to authorize the user.because authorization is the process which is implemented after authentication. In the application, we don't use firebase or any third-party library to implement authentication system.
        //firstly, npm i bcrypt. then require bcrypt. then follow the procedure to encrypt password.
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            name: req.body.name,
            userName: req.body.userName,
            password: hashedPassword
        });
        await newUser.save();
        res.status(200).json({
            message: "Signup was successfull"
        });
    }
    catch {
        res.status(500).json({
            error: "Signup failed"
        });
    }
});


//*LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.find({ userName: req.body.userName });
        if (user && user.length > 0) {
            //bcrypt.compare is used to compare the two passwords. 1.user's decoded password which is come from login section and 2.user's encoded(hash) password which is come from database(this hash password is stored in DB when the user firstly signup the site)
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password);

            if (isValidPassword) {
                //generate token
                const token = jwt.sign({
                    userName: user[0].userName,
                    userId: user[0]._id
                }, process.env.JWT_SECRET, {
                    expiresIn: '1h'
                });

                res.status(200).json({
                    "access_Token": token,
                    "message": "Login successful!"
                })
            }
            else {
                res.status(401).json({
                    "error": "Authenticate failed!"
                })
            }
        }
        else {
            res.status(401).json({
                "error": "Authenticate failed!"
            })
        }
    }
    catch {
        res.status(401).json({
            "error": "Authenticate failed!"
        })
    }
})


//GET ALL USERS
router.get('/all', checkLogin, async (req, res) => {
    try {
        const users = await User.find({}).populate("todos");
        res.status(200).json({
            message: "Success",
            data: users
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "There was an error on the server side"
        });
    }
})

module.exports = router;
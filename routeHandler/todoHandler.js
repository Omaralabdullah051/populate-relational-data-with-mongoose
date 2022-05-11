const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const todoSchema = require('../schemas/todoSchema');
const userSchema = require('../schemas/userSchema');
const Todo = new mongoose.model("Todo", todoSchema)
const User = new mongoose.model("User", userSchema)
const checkLogin = require('../middlewares/checkLogin');

//*GET ALL THE TODOS
router.get('/', checkLogin, async (req, res) => {
    console.log(req.userName);
    console.log(req.userId);
    try {
        const data = await Todo.find({}).populate("user", "name userName -_id");
        res.status(200).json({
            result: data,
            message: "Success"
        })
    }
    catch (err) {
        res.status(500).json({
            error: "There was a server side error"
        });
    }
});

router.post('/', checkLogin, async (req, res) => {
    const newTodo = new Todo({
        ...req.body,
        user: req.userId
    });
    try {
        const todo = await newTodo.save();
        await User.updateOne({
            _id: req.userId
        }, {
            $push: {
                todos: todo._id
            }
        })

        res.status(200).json({
            message: "Todo was inserted successfully!"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "There was a server side error"
        });
    }
});

module.exports = router;
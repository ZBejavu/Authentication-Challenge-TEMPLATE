const { Router } = require('express');
//const checkToken = require('../middleware/auth');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const JWT_SECRET = "J12EWc145";
const JWT_REFRESH_SECRET = "J12EJ12EWc145Wc145";
const checkToken = require('./auth');
const router = Router();
const INFORMATION = require('./information');
const USERS = require('./allusers');
const app = require('./app');
router.get('/information', (req, res) => {

    const user = INFORMATION.filter(user => {
        return user.name === req.decoded.name
    })
    res.status(200).json(user);
})

router.get('/users', checkToken, async (req, res) => {
    const {name} = req.decoded;
    const admin = USERS.find(user => user.name === name && user.isAdmin);
    if(!admin) return res.status(404).json({message: 'not an Admin'})
    res.status(200).json(USERS)
})


module.exports = router;
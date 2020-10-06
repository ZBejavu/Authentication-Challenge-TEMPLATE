const { Router } = require('express');
//const checkToken = require('../middleware/auth');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const checkToken = require('./auth');
const USERS = require('./allusers');
const JWT_SECRET = "J12EWc145";
const JWT_REFRESH_SECRET = "J12EJ12EWc145Wc145";
const router = Router();
const INFORMATION = require('./information');


async function generateAccessToken(user){
    //const newUser = JSON.parse(user)
    const newUser = JSON.stringify(user);
    return await jwt.sign({name:user.name, email:user.email},JWT_SECRET,
        { expiresIn: '10s'} // expires in 24 hours  
    )
}

router.get('/', (req, res) => {
    res.json(USERS);
})

router.post('/register' , async (req, res) => {
   const {email, name, password} = req.body;
   if(!name || !email || !password){
    return res.status(400).json({message:'missing data in request body'});
    }
    if( USERS.some(user => user.email === email)){
        return res.status(409).json({message: 'user already exists'});
    }
try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {name, email, password: hashedPassword}
    USERS.push(newUser);
    INFORMATION.push({name, info:`${name}info`})
    return res.status(201).json({message:'Register Success'});
}catch(e){
    res.status(500).json({message:'stupid people designed me'});
}

})
router.post('/login' , async (req, res) => {
    
    const {email, password} = req.body;
    if(!email || !password){
     return res.status(400).json({message:'missing data in request body'});
     }
    try{
        const user = USERS.find(user => user.email === email);
        if(!user) return res.status(404).json({message:'no user found'})
        if(!bcrypt.compare(password, user.password)) return res.status(403).json({message:'User or Password incorrect'})
        const accessToken = await generateAccessToken(user)
        const refreshToken = await jwt.sign(user ,JWT_REFRESH_SECRET,
            { expiresIn: '24h'} // expires in 24 hours  
        )
        res.status(200).json({accessToken, refreshToken, userName: user.name, isAdmin:user.isAdmin});
    }catch(e){
        console.log(e)
        res.status(500).json({message:'error in my server'});
    }
})

router.post('/logout', async (req, res) => {
    const {token} = req.body;
    if(!token) return res.status(401).json({message:'Access Token Required'})

    jwt.verify(token, JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            message: 'Token is not valid'
          });
        } else {    
            return res.status(200).json({message:"User Logged Out Successfully"}); 
        }
      });
})

router.post('/token', async (req, res) => {
    const {token} = req.body;
    if(!token) return res.status(401).json({message:'Refresh Token Required'})
    jwt.verify(token, JWT_REFRESH_SECRET, async (err, decoded) => {
        if(err) return res.status(403).json({message:'Invalid Refresh Token'})
        const accessToken = await generateAccessToken(decoded);
        return res.status(200).json({accessToken})
    })
})

router.post('/tokenValidate', checkToken, async (req, res) => {
    return res.status(200).json({valid: true})
})

module.exports = router;
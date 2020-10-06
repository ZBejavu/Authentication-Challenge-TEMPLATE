/* write your server code here */
const express = require('express')
const checkToken = require('./auth');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "J12EWc145";
const USERS = require('./allusers');
const app = express()
app.use(express.json())

app.use('/users/', require('./users'))
app.use('/api/v1/',checkToken, require('./admin'))
app.get('/allRoutes', (req, res) => {
    const adminStack = require('./admin').stack;
    const usersStack = require('./users').stack;
    const mainStack = app._router.stack;
    //console.log(admin.stack);
    // const fullRoutes = [...mainStack, ...usersStack,...adminStack].filter(Layer => Layer.route).map(Layer => {return {path: Layer.route.path, methods:Layer.route.methods}});
    const mainRoutes = mainStack.filter(Layer => Layer.route).map(Layer => {return {path: Layer.route.path, methods:Layer.route.methods}});
    const usersRoutes = usersStack.filter(Layer => Layer.route).map(Layer => {return {path: Layer.route.path, methods:Layer.route.methods}});
    const adminRoutes = adminStack.filter(Layer => Layer.route).map(Layer => {return {path: Layer.route.path, methods:Layer.route.methods}});
    console.log('asdas')
    res.json('success');
})



  let optionsArr = [
    { method: "post", path: "/users/register", description: "Register, Required: email, user, password", example: { body: { email: "user@email.com", name: "user", password: "password" } } },
    { method: "post", path: "/users/login", description: "Login, Required: valid email and password", example: { body: { email: "user@email.com", password: "password" } } },
    { method: "post", path: "/users/token", description: "Renew access token, Required: valid refresh token", example: { headers: { token: "\*Refresh Token\*" } } },
    { method: "post", path: "/users/tokenValidate", description: "Access Token Validation, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "get", path: "/api/v1/information", description: "Access user's information, Required: valid access token", example: { headers: { Authorization: "Bearer \*Access Token\*" } } },
    { method: "post", path: "/users/logout", description: "Logout, Required: access token", example: { body: { token: "\*Refresh Token\*" } } },
    { method: "get", path: "/api/v1/users", description: "Get users DB, Required: Valid access token of admin user", example: { headers: { authorization: "Bearer \*Access Token\*" } } }
  ]

app.options('/', checkToken2, (req, res) => {
    let arrToSend =[];
    if(req.noToken){
        arrToSend = optionsArr.filter(option => option.path === '/users/register'|| option.path === '/users/login')
        return res.status(200).json(arrToSend)
    }
    if(req.invalidToken){
        arrToSend = optionsArr.filter(option => option.path === '/users/register'|| option.path === '/users/login' || option.path === '/users/token')
        console.error('stupid test' , arrToSend.length)
        return res.status(200).json(arrToSend)
    }
    if(req.adminAuth){
        return res.status(200).json(optionsArr)
    }
    if(req.regularUser){
        arrToSend = optionsArr.filter(option => option.path !== '/api/v1/users')
        
        return res.status(200).json(arrToSend)
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

function checkToken2(req, res, next){
    let accessToken = req.headers["authorization"];
    if(!accessToken){
        req.noToken = true;
        return next();
        //res.status(401).json({message:'Access Token Required'})
    } 
    //     if (accessToken) {
    //     // Remove Bearer from string
    //     accessToken = accessToken.slice(7, accessToken.length);
    // }
    accessToken = accessToken.split(' ')[1];
    jwt.verify(accessToken, JWT_SECRET, async (err, decoded) => {
        if (err) {
            req.invalidToken = true;
            return next();
        }
        if(USERS.some(user => user.name === decoded.name && user.isAdmin)){
            req.adminAuth = true;
            return next();
        }
          req.regularUser = true;
          return next();
      });
}


app.use((request, response, next) => {
    response.status(404).send("Unknown Endpoint");
  });

module.exports = app;
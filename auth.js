
const jwt = require('jsonwebtoken');
const JWT_SECRET = "J12EWc145";
const JWT_REFRESH_SECRET = "J12EJ12EWc145Wc145";
const checkToken = (req, res, next) =>{
    let accessToken = req.headers["authorization"];
    if(!accessToken) return res.status(401).json({message:'Access Token Required'})
    //     if (accessToken.startsWith('bearer ')) {
    //     // Remove Bearer from string
    //     accessToken = accessToken.slice(7, accessToken.length);
    // }
    accessToken = accessToken.split(' ')[1];
    jwt.verify(accessToken, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            message: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
}


module.exports = checkToken
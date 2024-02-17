const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const verifyToken = async (req, res, next) => {
   if (process.env.JWT_SECURITY.toString() == "true") {
    // Get the token from the request headers
  const [bearer,token] = req.headers.authorization.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token is missing' });
  }
  //console.log(token);
  try {
    // Verify the token
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);

    // Attach the decoded payload to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
   } else {
    next();
   }
};

module.exports = verifyToken;

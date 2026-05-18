const jwt = require("jsonwebtoken");
const tryCatch = require("../utils/tryCatch");
const AppError = require("../utils/AppError");
const JWT_SECRET = process.env.JWT_SECRET;

const AuthMiddleware = tryCatch(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new AppError("No Authorization Header", 401);
  }

  const decode = jwt.verify(token, JWT_SECRET);
  
  req.user = decode; 
  console.log(req.user);
  
   

  next();
});

module.exports = AuthMiddleware;

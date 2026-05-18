const jwt = require('jsonwebtoken');

const generateToken = (user, time = '10d') => {
  const token = jwt.sign({ id: user.id , username : user.username ,role_name: user.role_name }, process.env.JWT_SECRET, {
    expiresIn: time
  });

  return token
}

module.exports = {
  generateToken
}
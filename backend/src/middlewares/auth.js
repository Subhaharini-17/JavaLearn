const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const auth = req.header('Authorization');
  if (!auth) return res.status(401).json({ msg: 'No token' });
  
  const token = auth.replace('Bearer ', '');
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token error' });
  }
};
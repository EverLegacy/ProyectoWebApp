const jwt = require('jsonwebtoken');

// function authMiddleware(req, res, next) {
//   const header = req.headers.authorization;
//   if (!header || !header.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'No token provided' });
//   }
//   try {
//     const token = header.split(' ')[1];
//     req.user = jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// }
function authMiddleware(req, res, next) {
  console.log('Authorization:', req.headers.authorization);

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
module.exports = authMiddleware;

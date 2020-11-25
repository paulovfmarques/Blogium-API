const sessionsRepository = require("../repositories/sessionsRepository");
const usersRepository = require("../repositories/usersRepository");

function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).send({ error: 'Auth header not found' });

    const token = authHeader.replace('Bearer ', '');
    const session = sessionsRepository.findByToken(token);
    if (!session) return res.status(401).send({ error: 'Invalid token' });

    const user = usersRepository.findById(session.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
  
    req.user = user;
    req.session = session;
  
    next();
}

module.exports = authMiddleware;
const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const UnauthorisedError = require('../errors/unauthtorisedError');

// eslint-disable-next-line consistent-return
const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const error = new UnauthorisedError('Необходима авторизация');
    next(error);
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secreteKey');
  } catch (err) {
    const error = new UnauthorisedError('Необходима авторизация');
    next(error);
  }
  req.user = payload;
  next();
};

module.exports = verifyToken;

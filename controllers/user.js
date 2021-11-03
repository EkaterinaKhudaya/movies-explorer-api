const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const NotFoundError = require('../errors/notFoundError');
const DefaultError = require('../errors/defaultError');
const ValidationError = require('../errors/validationError');
const ConflictError = require('../errors/conflictError');
const UnauthorisedError = require('../errors/unauthtorisedError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUserInfo = (req, res, next) => User.findById(req.user._id)
  .then((user) => {
    if (!user) {
      const error = new NotFoundError('Пользователь не найден.');
      next(error);
    } else {
      res.status(200).send({ data: user });
    }
  })
  .catch(() => {
    const error = new DefaultError('Произошла ошибка на сервере');
    next(error);
  });

const changeUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user && user._id.toString() !== req.user._id) {
        const error = new ConflictError('Пользователь с такой почтой уже существует.');
        next(error);
      }
      if (user && user._id.toString() === req.user._id
        && (user.email === email || user.name === name)) {
        const error = new ValidationError('Переданы некорректные данные при обновлении пользователя');
        next(error);
      } else {
        User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
          .then((response) => {
            if (!response) {
              const error = new NotFoundError('Пользователь с указанным _id не найден.');
              next(error);
            }
            const { _id } = response;
            res.status(200).send({
              data: {
                email: response.email,
                name: response.name,
                _id,
              },
            });
            res.end();
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              const error = new ValidationError('Переданы некорректные данные при обновлении пользователя');
              next(error);
            } else if (err.name === 'CastError') {
              const error = new ValidationError('Невалидный id');
              next(error);
            } else {
              const error = new DefaultError('Произошла ошибка на сервере');
              next(error);
            }
          });
      }
    })
    .catch(() => {
      const error = new DefaultError('Произошла ошибка на сервере');
      next(error);
    });
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const error = new ConflictError('Такой пользователь уже есть');
        next(error);
      }
      return bcrypt.hash(password, 10)
        .then((hash) => User.create({
          name, email, password: hash,
        })
          .then(() => {
            res.status(201).send({
              data: {
                name, email,
              },
            });
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              const error = new ValidationError('Переданы некорректные данные');
              next(error);
            } else {
              const error = new DefaultError('Произошла ошибка на сервере');
              next(error);
            }
          }));
    })
    .catch((err) => {
      const error = new UnauthorisedError(err.message);
      next(error);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new ValidationError('Нет email или пароля');
    next(error);
  }
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const error = new UnauthorisedError('Логин или пароль не совпадают');
        next(error);
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          const error = new DefaultError('Произошла ошибка на сервере');
          next(error);
        }
        if (!result) {
          const error = new UnauthorisedError('Логин или пароль не совпадают');
          next(error);
        } else {
          const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secreteKey', { expiresIn: '7d' });
          res.send({ token });
        }
      });
    })
    .catch((err) => {
      const error = new UnauthorisedError(err.message);
      next(error);
    });
};

module.exports = {
  createUser, login, getUserInfo, changeUserInfo,
};

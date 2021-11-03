const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRouter = require('./user');
const movieRouter = require('./movie');

const {
  createUser, login,
} = require('../controllers/user');
const verifyToken = require('../middlewares/auth');

router.use('/users', verifyToken, userRouter);

router.use('/movies', verifyToken, movieRouter);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

router.use('/', verifyToken);
module.exports = router;

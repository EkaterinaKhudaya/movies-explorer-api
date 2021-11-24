const movieRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validateURL = require('../validators/validators');

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movie');

movieRouter.get('/', getMovies);
movieRouter.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().custom(validateURL),
    trailer: Joi.string().custom(validateURL),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().custom(validateURL),
    movieId: Joi.number().required(),
  }),
}), createMovie);

movieRouter.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.number().required(),
  }),
}), deleteMovie);

module.exports = movieRouter;

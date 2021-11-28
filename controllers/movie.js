const Movie = require('../models/movies');
const DefaultError = require('../errors/defaultError');
const ValidationError = require('../errors/validationError');
const NotFoundError = require('../errors/notFoundError');
const ForbiddenError = require('../errors/forbiddenError');

const getMovies = (req, res, next) => Movie.find({})
  .then((movies) => {
    res.send('200', filter);
  })
  .catch(() => {
    const error = new DefaultError('Произошла ошибка на сервере');
    next(error);
  });

const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;
  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movies) => res.send('201', movies))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные при создании карточки фильма');
        next(error);
      } else {
        const error = new DefaultError('Произошла ошибка на сервере');
        next(error);
      }
    });
};

const deleteMovie = (req, res, next) => Movie.findById(req.params.movieId)
  .then((movie) => {
    if (!movie) {
      const error = new NotFoundError('Фильм с указанным id не найдена.');
      return next(error);
    }
    if (!movie.owner.equals(req.user._id)) {
      const error = new ForbiddenError('Нельзя удалить чужой фильм.');
      return next(error);
    }
    return Movie.deleteOne(movie)
      .then(() => res.send('201', movie));
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      const error = new ValidationError('Невалидный id');
      next(error);
    } else {
      const error = new DefaultError('Произошла ошибка на сервере');
      next(error);
    }
  });

module.exports = {
  getMovies, createMovie, deleteMovie,
};

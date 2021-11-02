require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const {NODE_ENV,MONGO_DB} = process.env;
const NotFoundError = require('./errors/notFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const router = require('./routes/router');

const allowedCors = [
  'localhost:3000',
  'https://moviesekaterinakh.space',
];

const { port = 3000 } = process.env;
const app = express();

// eslint-disable-next-line no-console
mongoose.connect(NODE_ENV === 'production' ? MONGO_DB : 'mongodb://localhost:27017/moviesdb', (err) => console.log(err));
app.use(requestLogger);

app.use((req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.end();
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use((req, res, next) => {
  const error = new NotFoundError('Страницы не существует');
  next(error);
});
app.use(errorLogger);
app.use(errors());


app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'Ошибка на сервере' : message });
});

app.listen(port, () => {
  console.log('Start successfully');
});

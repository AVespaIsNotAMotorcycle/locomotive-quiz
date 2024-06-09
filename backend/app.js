const express = require('express');
const cors = require('cors');
const axios = require('axios');

const models = require('./models');
const images = require('./images');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 8000;

const extractModels = (page) => {
  const regex = /Model.*/g;
  const modelTitles = page
    .match(regex)
    .map((title) => title.substring('Model: '.length));
  return modelTitles;
};

const extractImage = (page) => {
  const regex = /\<img.*src\=".+".*\/\>\<\/td\>/g;
  const [imageElement] = page.match(regex);
  const properties = imageElement.split(' ');
  const sourceProperty = properties.find((property) => property.includes('src="'));
  const [imageSource] = sourceProperty.match(/\".*\"/);
  return imageSource.substring(1, imageSource.length - 1);
};

const extractInfo = (page) => ({
  models: extractModels(page),
  image: extractImage(page),
});

app.get('/random', images.getRandom);

app.get('/models/:manufacturer?/:model?', models.get);
app.get('/images/:model?/:source?', images.get);

app.get('/hello', (request, response) => response.send('Hello World!'));

app.listen(PORT);

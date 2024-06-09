const connection = require('./mysql');

const pickRandom = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};
const getAll = (table) => new Promise((resolve, reject) => {
  connection.query(`SELECT * FROM ${table}`, (error, results) => {
    if (error) {
      reject(error);
    } else {
      resolve(results);
    }
  });
});
const getRandomModels = () => new Promise(async (resolve, reject) => {
  try {
    const allModels = await getAll('models');
    const selection = [];
    while (selection.length < 4) {
      const { model } = pickRandom(allModels);
      if (!selection.includes(model)) selection.push(model);
    }
    resolve(selection);
  } catch (error) {
    reject(error);
  }
});
const getAllModelsInImage = ({ source }) => new Promise((resolve, reject) => {
  connection.query(`SELECT model FROM images WHERE source = '${source}'`, (error, results) => {
    if (error) {
      reject(error);
    } else {
      const models = results.map((row) => row.model);
      console.log('all models in image', results, models);
      resolve(models);
    }
  });
});
const getOptionsList = (actualModels, randomModels) => {
  const options = [...actualModels];
  randomModels.forEach((model) => {
    if (options.includes(model)) return;
    if (options.length >= 4) return;
    options.push(model);
  });
  return options;
};
const getRandom = async (request, response) => {
  try {
    const allImages = await getAll('images');
    const image = pickRandom(allImages);
    const randomModels = await getRandomModels();
    const imageModels = await getAllModelsInImage(image);
    response.send({
      source: image.source,
      models: imageModels,
      options: getOptionsList(imageModels, randomModels),
    });
  } catch (error) {
    response.reject(error);
  }
};

const get = (request, response) => {
  const { model, source } = request.params;
  let query = 'SELECT * FROM images';
  if (model) query = query.concat(` WHERE model = '${model}'`);
  if (source) query = query.concat(` AND source = '${source}'`);
  connection.query(query, (error, results) => {
    console.log(query);
    if (!error) { response.send(results); return; }
    console.error(error);
    response.send('Something went wrong');
  });
};

module.exports = { get, getRandom };

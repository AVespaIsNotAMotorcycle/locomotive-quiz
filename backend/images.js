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
const getManufacturerOfModel = (model) => new Promise((resolve, reject) => {
  connection.query(`SELECT manufacturer FROM models WHERE model = '${model}'`, (error, results) => {
    if (error) {
      reject(error);
    } else {
        if (results.length) {
        const [row1] = results;
        const { manufacturer } = row1;
        resolve(manufacturer);
      } else {
        resolve(undefined);
      }
    }
  });
});
const getAllModelsInImage = ({ source }) => new Promise((resolve, reject) => {
  connection.query(`SELECT model FROM images WHERE source = '${source}'`, (error, results) => {
    if (error) {
      reject(error);
    } else {
      const models = results.map((row) => row.model);
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
const getManufacturers = (models) => new Promise(async (resolve) => {
  try {
    const manufacturers = [];
    for (let index = 0; index < models.length; index += 1) {
      const manufacturer = await getManufacturerOfModel(models[index]);
      manufacturers.push(manufacturer);
    }
    resolve(manufacturers);
  } catch {
    resolve(models.map(() => undefined));
  }
});
const getRandom = async (request, response) => {
  try {
    const allImages = await getAll('images');
    const image = pickRandom(allImages);
    const randomModels = await getRandomModels();
    const imageModels = await getAllModelsInImage(image);
    const options = getOptionsList(imageModels, randomModels);
    const manufacturers = await getManufacturers(options);
    response.send({
      source: image.source,
      models: imageModels,
      options,
      manufacturers,
    });
  } catch (error) {
    console.error(error);
    response.send(error);
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

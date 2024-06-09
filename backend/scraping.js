const axios = require('axios');
const connection = require('./mysql');

const pictureURL = (id) => `http://www.rrpicturearchives.net/showPicture.aspx?id=${id}`;

const storeImage = (id, { models, image }) => {
  models.forEach((model) => {
    connection.query(
      `INSERT INTO images VALUES ('${image}', '${model}', '${pictureURL(id)}')`,
      (error, results) => {
        if (error) console.error(error);
        else console.log(`Added image ${id} of model ${model}`);
      },
    );
  });
}

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

const getPicture = (id) => new Promise((resolve, reject) => {
  console.log(`Getting picture with id ${id}`);
  axios.get(pictureURL(id))
    .then(({ data }) => { resolve(extractInfo(data)); })
    .catch(reject);;
});

const extractListIDs = (listPage) => {
  const regex = /\/showPicture\.aspx\?id\=[0-9]+/g;
  const hrefs = listPage.match(regex);
  const ids = hrefs.map((href) => href.substring(
    '/showPicture.aspx?id='.length,
  ));
  return ids;
};

const getList = (id) => new Promise((resolve, reject) => {
  console.log(`Getting all images of locomotive with id ${id}`);
  axios.get(`http://www.rrpicturearchives.net/modelthumbs.aspx?mid=${id}`)
    .then(({ data }) => { resolve(extractListIDs(data)); })
    .catch(reject);
});

getList(10)
  .then((imageIDs) => {
    console.log(imageIDs);
    const imageDetails = imageIDs.map((id) => {
      getPicture(id)
        .then((details) => { storeImage(id, details); })
        .catch(console.error);
    });
  })
  .catch(console.error);

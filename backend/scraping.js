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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const scrapeImages = async () => {
  for (let index = 0; index < 400; index += 1) {
    getList(index)
      .then((imageIDs) => {
        console.log(imageIDs);
        const imageDetails = imageIDs.map((id) => {
          getPicture(id)
            .then((details) => { storeImage(id, details); })
            .catch(console.error);
        });
      })
      .catch(console.error);
    await sleep(10000);
  }
};
scrapeImages();
/*
const EMD = [
  '40 Ton', 'F40PH-2C', 'GP20', 'GT26CU-3', 'SD40-2B', 'SD90MAC-H',
  'AA', 'F40PHM-2', 'GP20D', 'GT26CUMP', 'SD40-2F', 'SD90MAC-H2',
  'AB6', 'F40PHR', 'GP28', 'GT26M2C', 'SD40-2W', 'SDF40-2',
  'AEM7', 'F45', 'GP30', 'GT26MC', 'SD40A', 'SDL39',
  'AT46C', 'F59PH', 'GP30B', 'GT38AC', 'SD40T-2', 'SDL50',
  'B12', 'F59PHI', 'GP35', 'GT42CU-AC', 'SD40X', 'SDP35',
  'BL2', 'F69PH-AC', 'GP38', 'GT45C-ACe', 'SD45', 'SDP40',
  'BL20-2', 'F7A', 'GP38-2', 'JT26C-2SS', 'SD45-2', 'SDP40F',
  'DD35', 'F7B', 'GP38-2B', 'JT26CW-SS', 'SD45-2B', 'SDP45',
  'DD35A', 'F9A', 'GP38-2W', 'JT42CWR', 'SD45M', 'SW',
  'DDA40X', 'F9B', 'GP38AC', 'LWT-12', 'SD45T-2', 'SW1',
  'DDM45', 'FL9', 'GP39', 'Motorcar', 'SD45X', 'SW1000',
  'DE30AC', 'FP45', 'GP39-2', 'MP15', 'SD50', 'SW1001',
  'DM30AC', 'FP7A', 'GP40', 'MP15AC', 'SD50F', 'SW1002',
  'E1A', 'FP9A', 'GP40-2', 'MP15DC', 'SD50S', 'SW1200',
  'E2A', 'FT', 'GP40-2LW', 'MP15T', 'SD60', 'SW1200RS',
  'E3A', 'FTA', 'GP40P', 'MRS1', 'SD60F', 'SW13B',
  'E3B', 'FTB', 'GP40P-2', 'NC', 'SD60I', 'SW1500',
  'E4A', 'G12', 'GP40TC', 'NF-210', 'SD60M', 'SW1504',
  'E5A', 'G16', 'GP40X', 'NW1', 'SD60MAC', 'SW600',
  'E5B', 'G16U', 'GP49', 'NW2', 'SD7', 'SW7',
  'E6A', 'G22', 'GP50', 'NW3', 'SD70', 'SW8',
  'E6B', 'G26CW', 'GP59', 'NW5', 'SD70ACe', 'SW9',
  'E7A', 'G6B', 'GP60', 'RS1325', 'SD70AH', 'SW900',
  'E7B', 'G8', 'GP60B', 'SC', 'SD70AH-T4', 'TA',
  'E8A', 'GA8', 'GP60M', 'SD18', 'SD70I', 'TR2A',
  'E8B', 'GF6C', 'GP7', 'SD24', 'SD70M', 'TR2B',
  'E9A', 'GL8', 'GP7B', 'SD24B', 'SD70M-2', 'TR3A',
  'E9B', 'GM10B', 'GP8', 'SD28', 'SD70MAC', 'TR3B',
  'EA', 'GM5FC', 'GP9', 'SD35', 'SD75I', 'TR4A',
  'F2A', 'GM6C', 'GP9B', 'SD38', 'SD75M', 'TR4B',
  'F3A', 'GMD1', 'GR12W', 'SD38-2', 'SD80ACe', 'TR5A',
  'F3B', 'GP15-1', 'GT18', 'SD38AC', 'SD80MAC', 'TR5B',
  'F40C', 'GP15AC', 'GT18MC', 'SD39', 'SD89MAC', 'TR6A',
  'F40PH', 'GP15T', 'GT22', 'SD40', 'SD9', 'TR6B',
  'F40PH-2', 'GP18', 'GT26CU-2', 'SD40-2', 'SD9043MAC',
];
const GE = [
  '100Tonner', 'AC44CW', 'C30-7A', 'CW44-6', 'P-5', 'U23C',
  '110Tonner', 'AC44CWCTE', 'C30-7Ai', 'Doodlebug', 'P30CH', 'U25B',
  '125Tonner', 'AC44i', 'C30-S7', 'E10B', 'P32AC-DM', 'U25C',
  '132Tonner', 'AC45CCTE', 'C30-S7MP', 'E33', 'P40DC', 'U26C',
  '2-C-C-2', 'AC60CW', 'C30-S7N', 'E40', 'P42DC', 'U28B',
  '2-D-D-2', 'Arrow II MU', 'C32-8', 'E44', 'S-2', 'U28C',
  '23Tonner', 'Arrow III MU', 'C36-7', 'E50C', 'SG10B', 'U28CG',
  '25 Tonner', 'B23-7', 'C38MEi', 'E60', 'Silverliner IV', 'U30B',
  '35Tonner', 'B30-7', 'C39-8', 'EP-5', 'SL 110', 'U30C',
  '44Tonner', 'B30-7A', 'C39-8E', 'ES40ACi', 'SL-136', 'U30CG',
  '4500 GTEL', 'B30-7AB', 'C40-8', 'ES40DC', 'SL-144', 'U33B',
  '45Tonner', 'B32-8', 'C40-8M', 'ES44AC', 'SL-85', 'U33C',
  '50Tonner', 'B32-8WH', 'C40-8W', 'ES44AC-H', 'Steeple Cab', 'U34CH',
  '55Tonner', 'B36-7', 'C40-9', 'ES44C4', 'U10B', 'U36B',
  '60Tonner', 'B39-8', 'C40-9W', 'ES44DC', 'U12B', 'U36C',
  '65Tonner ', 'B39-8E', 'C41-8', 'ES44DCi', 'U13C', 'U50',
  '70Tonner', 'B40-8', 'C41-8W', 'ES58ACi', 'U15C', 'U50C',
  '80Tonner', 'B40-8W', 'C44-8W', 'ET44AC', 'U18B', 'U5B',
  '8500 GTEL', 'BB40-8M', 'C44-9W', 'ET44AH', 'U18C1', 'U6B',
  '85Tonner', 'BB40-9M', 'C44-9WL', 'ET44C4', 'U20C', 'UM20',
  '86Tonner', 'BB40-9WM', 'C44-EMi', 'GG1', 'U20C1', 'UM6B',
  '90 Class', 'Boxcab', 'C44aci', 'M-3 Metropolitan', 'U22C', 'Unknown',
  '95 Tonner', 'BQ23-7', 'CV40-9i', 'MATE', 'U23B', 'Z-5-A',
  'AC4460CW', 'C30-7',
];
EMD.forEach((model) => {
  connection.query(`INSERT INTO models VALUES ('${model}', 'EMD', NULL, NULL)`, (error, results) => {
    if (error) { console.error(error); return; }
    console.log(`Added EMD ${model} to database`);
  });
})
*/

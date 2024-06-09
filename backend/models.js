const connection = require('./mysql');

const get = (request, response) => {
  const { manufacturer, model } = request.params;
  let query = 'SELECT * FROM models';
  if (manufacturer) query = query.concat(` WHERE manufacturer = '${manufacturer}'`);
  if (model) query = query.concat(` AND model = '${model}'`);
  connection.query(query, (error, results) => {
    console.log(query);
    if (!error) { response.send(results); return; }
    console.error(error);
    response.send('Something went wrong');
  });
};

module.exports = { get };

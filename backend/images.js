const connection = require('./mysql');

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

module.exports = { get };

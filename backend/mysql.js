const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'backend',
  password: 'P1jVtqoc9TRs4puH',
  database: 'locomotive_quiz',
});
connection.connect();

module.exports = connection;

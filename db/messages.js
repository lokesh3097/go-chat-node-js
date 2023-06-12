'use strict';

var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

var con = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 1000,
  dateStrings: true,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  queueLimit: 100,
  multipleStatements: true
});

module.exports.findMessagesByChatId = (chatId, done) => {
    con.getConnection(function(err, connection) {
        if (err) done(new Error("Invalid Request: Connection Failed!"));
        else {
            let sql = "SELECT * FROM messages WHERE chat_id = ?";
            connection.query(sql, [chatId], function(err, results) {
                if (err) return done(new Error("Invalid Request: Query Error!"));
                else {
                    return done(null, results);
                }
            });

            connection.release();
        }
    });
};

module.exports.addNewMessage = (chatId, message, sentBy, done) => {
    con.getConnection(function(err, connection) {
        if (err) done(new Error("Invalid Request: Connection Failed!"));
        else {
            let sql = "INSERT INTO messages (chat_id, message, sent_by) VALUES (?, ?, ?);";
            connection.query(sql, [chatId, message, sentBy], (err) => {
                if (err) return done(new Error("Invalid Request: Query Error!"));
                else {
                    return done(null);
                }
            });
        }
    });
};
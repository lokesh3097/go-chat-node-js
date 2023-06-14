'use strict';

var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const users = require('./users');

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

module.exports.findUserByEmail = (userEmail, done) => {
    con.getConnection(function(err, connection) {
        if (err) done(new Error("Invalid Request: Connection Failed!"));
        else {
            let sql = "SELECT * FROM users WHERE user_email = ?";
            connection.query(sql, [userEmail], function(err, results){
                if (err) return done(new Error("Invalid Request: Query Error!"));
                else {
                    if (results.length != 0) {
                        return done(null, results[0]);
                    } else {
                        let insertSql = "INSERT INTO users (user_email) VALUES (?);";
                        connection.query(insertSql, [userEmail], (err, result) => {
                            if (err) return done(new Error("Invalid Request: New User Insert Error!"));
                            else {
                                let newUserId = result.insertId;
                                users.findUserByUserId(newUserId, (err, user) => {
                                    if (err) return done(new Error("Invalid Request: Query Error!"));
                                    else {
                                        return done(null, user);
                                    }
                                });
                                console.log("New User INSERT Successful!!!");
                            }
                        });
                        // return done (null, null);
                    }
                }
            });

            connection.release();
        }
    });
};

module.exports.findUserByUserId = (userId, done) => {
    con.getConnection(function(err, connection) {
        if (err) done(new Error("Invalid Request: Connection Failed!"));
        else {
            let sql = "SELECT * FROM users WHERE user_id = ?";
            connection.query(sql, [userId], (err, results) => {
                if (err) return done(new Error("Invalid Request: Query Error!"));
                else {
                    return done(null, results[0]);
                }
            });
        }
    });
};
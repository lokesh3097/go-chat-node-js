'use strict';

var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const users = require('./users');
const messages = require('./messages');

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
                    if (results.length != 0)
                        return done(null, results);
                    else
                        return done(null, null);
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
            connection.query(sql, [chatId, message, sentBy], (err, result) => {
                // console.log(this.sql);
                if (err) return done(err);
                else {
                    return done(null);
                }
            });
            connection.release();
        }
    });
};

module.exports.getChatByEmails = (email1, email2, done) => {
    con.getConnection(async function(err, connection) {
        if (err) done(new Error("Invalid Request: Connection Failed!"));
        else {
            let sql = "SELECT * FROM users WHERE user_email = ?; SELECT * FROM users WHERE user_email = ?;";

            connection.query(sql, [email1, email2], (err, results) => {
                if (err) throw err;
                else {
                    let user1 = results[0][0];
                    let user2 = results[1][0];

                    // console.log("USER1 IN messages.js: ", user1);
                    // console.log("USER2 IN messages.js: ", user2);

                    if (user1 && user2) {
                        // console.log("BOTH Users PRESEENT");
                        messages.getChatByUserIds(user1.user_id, user2.user_id, (err, chats) => {
                            if (err) throw err;
                            else {
                                let users = [];
                                users.push(user1);
                                users.push(user2);
    
                                if (!chats || chats[0].length == 0) {
                                    let newSql = "INSERT INTO chats (user_1, user_2) VALUES (?, ?);";
                                    connection.query(newSql, [user1.user_id, user2.user_id], (err, result) => {
                                        if (err) throw err;
                                        else {
                                            let resultObject = {
                                                users: users,
                                                messages: [],
                                                chatId: result.insertId
                                            };
                
                                            done(null, resultObject);
                                        }
                                    });
                                } else {
                                    let resultObject = {
                                        users: users,
                                        messages: chats[1],
                                        chatId: chats[0][0].chat_id
                                    };
        
                                    done(null, resultObject);
                                }
                            }
                        });
                    } else {
                        console.log("One User NOT Found!!!");

                        createUser(email1, connection, (user) => {
                            user1 = user;

                            if (!user2) {
                                createUser(email2, connection, (user) => {
                                    user2 = user;

                                    console.log("USER1: AFTER", user1);
                                    console.log("USER2: AFTER", user2);

                                    createChat(user1.user_id, user2.user_id, connection, (chatId) => {
                                        let users = [];
                                        users.push(user1);
                                        users.push(user2);

                                        let resultObject = {
                                            users: users,
                                            messages: null,
                                            chatId: chatId
                                        };
            
                                        done(null, resultObject);
                                    });
                                });
                            } else {
                                console.log("USER1: ", user1);
                                console.log("USER2: ", user2);

                                createChat(user1.user_id, user2.user_id, connection, (chatId) => {
                                    let users = [];
                                    users.push(user1);
                                    users.push(user2);

                                    let resultObject = {
                                        users: users,
                                        messages: null,
                                        chatId: chatId
                                    };
        
                                    done(null, resultObject);
                                });
                            }
                        });

                        // if (!user1) {
                        //     let sql = "INSERT INTO users (user_email) VALUES (?);"
                        //     connection.query(sql, [email1], (err, result) => {
                        //         if (err) throw err;
                        //         else {
                        //             let insertedUserId = result.insertId;
                        //             let userSql = "SELECT * FROM users WHERE user_id = ?";
                        //             connection.query(userSql, [insertedUserId], (err, results) => {
                        //                 if (err) throw err;
                        //                 else {
                        //                     user1 = results[0];

                        //                     if (!user2) {
                        //                         let sql = "INSERT INTO users (user_email) VALUES (?);"
                        //                         connection.query(sql, [email2], (err, result) => {
                        //                             if (err) throw err;
                        //                             else {
                        //                                 let insertedUserId = result.insertId;
                        //                                 let userSql = "SELECT * FROM users WHERE user_id = ?";
                        //                                 connection.query(userSql, [insertedUserId], (err, results) => {
                        //                                     if (err) throw err;
                        //                                     else {
                        //                                         user2 = results[0];
                        //                                     }
                        //                                 })
                        //                             }
                        //                         });
                        //                     }
                        //                 }
                        //             })
                        //         }
                        //     });
                        // } else if (!user2) {
                        //     let sql = "INSERT INTO users (user_email) VALUES (?);"
                        //     connection.query(sql, [email2], (err, result) => {
                        //         if (err) throw err;
                        //         else {
                        //             let insertedUserId = result.insertId;
                        //             let userSql = "SELECT * FROM users WHERE user_id = ?";
                        //             connection.query(userSql, [insertedUserId], (err, results) => {
                        //                 if (err) throw err;
                        //                 else {
                        //                     user2 = results[0];
                        //                 }
                        //             })
                        //         }
                        //     });
                        // }
                    }
                }
            });
            // users.findUserByEmail(email1, (err, user) => {
            //     if (err) throw err;
            //     else {
            //         if (user) {
            //             user1 = user;
            //             console.log("USER1: ", user);
            //         } else {
            //             console.log("NO USER FOUND");
            //             // res.json(null);
            //         }
            //     }
            // });

            // users.findUserByEmail(email2, (err, user) => {
            //     if (err) throw err;
            //     else {
            //         if (user) {
            //             user2 = user;
            //             console.log("USER2: ", user);
            //         } else {
            //             console.log("NO USER FOUND");
            //             // res.json(null);
            //         }
            //     }
            // });
        }
        connection.release();
    });
};

function createUser(userEmail, connection, done) {
    let user;
    let sql = "INSERT INTO users (user_email) VALUES (?);"
    connection.query(sql, [userEmail], (err, result) => {
        if (err) throw err;
        else {
            let insertedUserId = result.insertId;
            let userSql = "SELECT * FROM users WHERE user_id = ?";
            connection.query(userSql, [insertedUserId], (err, results) => {
                if (err) throw err;
                else {
                    user = results[0];
                    return done(user);
                }
            })
        }
    });
    // connection.release();
};

function createChat(userId1, userId2, connection, done) {
    let sql = "INSERT INTO chats (user_1, user_2) VALUES (?, ?);";
    connection.query(sql, [userId1, userId2], (err, result) => {
        if (err) throw err;
        else {
            done(result.insertId);
        }
    });
};

module.exports.getChatByUserIds = (userId1, userId2, done) => {
    con.getConnection(function(err, connection) {
        if (err) done(new Error("Invalid Request: Connection Failed!"));
        else {
            let sql = "SELECT chat_id FROM chats WHERE user_1 = ? AND user_2 = ?; SELECT * FROM messages WHERE chat_id = (SELECT chat_id FROM chats WHERE user_1 = ? AND user_2 = ?);";
            connection.query(sql, [userId1, userId2, userId1, userId2], (err, results) => {
                // if (err) return done(new Error("Invalid Request: Query Error!"));
                if (err) throw err;
                else {
                    if (results[0].length != 0)
                        return done(null, results);
                    else
                        return done(null, null);
                }
            });

            connection.release();
        }
    });
};
'use strict';

const db = require('../db');

module.exports.getChatById = (req, res) => {
    let chatId = req.params.chatId;

    db.messages.findMessagesByChatId(chatId, (err, messages) => {
        if (err) throw err;
        else {
            // console.log("Messages: ", messages);
            if (messages)
                res.json(messages);
            else
                res.json(null);
        }
    });
};

module.exports.postMessage = (req, res) => {
    let chatId = req.body.chatId;
    let message = req.body.message;
    let sentBy = req.body.sentBy;

    db.messages.addNewMessage(chatId, message, sentBy, (err) => {
        if (err) throw err;
        else {
            console.log("Message Added!!!");
            res.json({'status': "SUCCESS"});
        }
    })
};

module.exports.getUserByEmail = (req, res) => {
    let userEmail = req.params.userEmail;
    
    db.users.findUserByEmail(userEmail, (err, user) => {
        if (err) throw err;
        else {
            if (user) {
                res.json(user);
            } else {
                console.log("NO USER FOUND");
                res.json(null);
            }
        }
    });
};

module.exports.getChatsFromEmails = (req, res) => {
    let userEmails = [];
    let senderEmail = req.params.senderEmail;
    let receiverEmail = req.params.receiverEmail;
    userEmails.push(senderEmail);
    userEmails.push(receiverEmail);

    console.log("USER BEFORE SORT: ", userEmails);

    userEmails.sort();
    
    console.log("USER AFTER SORT: ", userEmails);

    db.messages.getChatByEmails(userEmails[0], userEmails[1], (err, resultObject) => {
        if (err) throw err;
        else {
            let usersFromResult = resultObject.users;
            if (usersFromResult[0].user_email != senderEmail) {
                let tempUser = usersFromResult[0];
                usersFromResult[0] = usersFromResult[1];
                usersFromResult[1] = tempUser;

                resultObject.users = usersFromResult;
            }
            res.json(resultObject);
        }
    });
};
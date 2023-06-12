'use strict';

const db = require('../db');

module.exports.getChatById = (req, res) => {
    let chatId = req.params.chatId;

    db.messages.findMessagesByChatId(chatId, (err, messages) => {
        if (err) throw err;
        else {
            // console.log("Messages: ", messages);
            res.json({'messages': messages});
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
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
var cors = require('cors');
dotenv.config();

const routes = require('./routes');

const app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/chat/:chatId', routes.gochat.getChatById);

app.post('/message', routes.gochat.postMessage);


app.listen(process.env.PORT, (err) => {
    if (err) console.log("Error in Server!!!");
    console.log("Listening on PORT: ", process.env.PORT);
});
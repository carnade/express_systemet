const axios = require("axios");
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const helmet = require('helmet')
const middlewares = require('./middlewares')
const mongoose = require('mongoose')
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');

require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
});

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(express.json());
//app.use(morgan('combined', { stream: accessLogStream }))
app.use(helmet());
app.use(express.json());

app.use(bodyParser.json());
// hook morganBody to express app
morganBody(app, { stream: accessLogStream });

const itemRoute = require('./routes/item.js');
app.use('/item/', itemRoute);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.listen(1337, () => console.log('Server started'))
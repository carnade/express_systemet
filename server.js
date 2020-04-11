const axios = require("axios");
const express = require('express')
const app = express()
const morgan = require('morgan')
const helmet = require('helmet')
const middlewares = require('./middlewares')
const mongoose = require('mongoose')

require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
});

app.use(express.json());
app.use(morgan('common'));
app.use(helmet());
app.use(express.json());

const betsRoute = require('./routes/item.js');
app.use('/item/', betsRoute);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.listen(1337, () => console.log('Server started'))
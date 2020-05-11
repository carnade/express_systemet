const axios = require("axios");
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const helmet = require('helmet')
const middlewares = require('./middlewares')
const mongoose = require('mongoose')
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv-flow').config({
    default_node_env: 'development'
    });
    console.log('SYSTEMET_URL:', process.env.SYSTEMET_URL);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('DATABASE_COLLECTION:', process.env.COLLECTION);
    console.log('CORS:', process.env.SERVER_URL);
    console.log('ENV:', process.env.CONF_ENV);

axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36';

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
});

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(cors({
    origin: process.env.SERVER_URL
  }))

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

app.listen(process.env.PORT, () => console.log('Server started on port ' + process.env.PORT))
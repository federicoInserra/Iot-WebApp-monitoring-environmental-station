//Load all the required components
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.listen(3000, ()=> console.log('listening at 3000'));
app.use(express.static('.'));
app.use(express.json());

const express = require('express');
const app = express();

app.listen(8080, () => console.log("Available at http://localhost:8080/"));

app.use(express.static('.'));


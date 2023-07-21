// app.js
const express = require('express');

const app = express();

// express static setup
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000);
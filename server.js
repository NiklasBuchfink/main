// create express server and run serverless.js function on it
const express = require('express');
const serverless = require('./serverless');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Server!');
}, (error) => {
  console.log(error);
});

app.post('/linkedin', serverless.handler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
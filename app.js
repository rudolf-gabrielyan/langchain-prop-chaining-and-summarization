const express = require('express');
const app = express();
require('dotenv').config();

const promptChaining = require('./functions/promptChaining');
const summarization = require('./functions/summarization');

const port = process.env.PORT;

app.get('/api/chain', promptChaining);
app.get('/api/summarize', summarization);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
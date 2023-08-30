const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('hello from this express ok!');
});

app.listen(port, () => {
    console.log(`server is running from ${port}`);
});
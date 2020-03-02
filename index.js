'use strict';

const EventEmitter = require('events');
const express = require('express');
const http = require('http');
const app = express();

const PORT = process.env.PORT || 9500;

// Set public folder as root
app.use(express.static(__dirname + '/public'));
// Provide access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

//app.get('/', (req, res) => => res.sendFile(path.join(__dirname+'/public/index.html')));

const server = http.createServer(app);
server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }

    console.log("DSMEM now running on port", server.address());
});
'use strict';

//const EventEmitter = require('events');
const bodyParser = require('body-parser')
const express = require('express');
const http = require('http');
const app = express();

const PORT = process.env.PORT || 9500;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public folder as root
app.use(express.static(__dirname + '/public'));
// Provide access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

//app.get('/', (req, res) => => res.sendFile(path.join(__dirname+'/public/index.html')));

const execJSON = require('./server/builder')
app.post('/attach', (req, res) => {
    console.log("attach bios :",req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json(execJSON.attach(req.body));
})
app.post('/build', (req, res) => {
    console.log("build: msg :",req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json(execJSON.build(req.body));
})
/*
let clientId = 0;
let clients = {}; // <- Keep a map of attached clients

const Stream = new EventEmitter(); 
Stream.on("push", (id, data) => {
    clients[id].res.write("data: " + JSON.stringify(data) + "\n\n");
    console.log("update: monotoring :",data); 
});

function scapeMetric(interval) {
    return setInterval(() => {
        for (clientId in clients) {
            Stream.emit("push", clientId, { msg: {id: process.env.INSTANCE_ID,memory:process.memoryUsage()} });
        };
    }, interval);
}
*/
const moderatorPNETS = require('./server/manager')
app.get('/execute/:taskid', (req, res) => {  
    console.log("execute: monotoring :",req.params.taskid);      
	res.writeHead(200, {
		'Content-Type': 'text/event-stream', // <- Important headers
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
    res.write('\n');
    moderatorPNETS.monitor(req,res,req.params.taskid)
    /*
	(function (clientId) {
        clients[clientId] = { 
            res : res, // <- Add this client to those we consider "attached"
            tid : scapeMetric(3000)
        }
		req.on("close", function () {
            clearInterval(clients[clientId].tid)
			delete clients[clientId]
		}); // <- Remove this client when he disconnects
    })(++clientId)
    */
})

app.post('/assign', (req, res) => {
    console.log("assign: msg :",req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json(moderatorPNETS.assign(req.body));    
})

const server = http.createServer(app);
server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }

    console.log("DSMEM now running on port", server.address());
});
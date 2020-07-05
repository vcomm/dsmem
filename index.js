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
    const bld = execJSON.build(req.body);
    if (bld.error)
        res.status(bld.error);
    else
        res.json(bld);
})

const moderatorPNETS = require('./server/manager')

app.get('/suid', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({sessionID: moderatorPNETS.genuuid()});    
});

app.get('/subscribe/:suid', (req, res) => {  
    //console.log("subscribe: monotoring :",req.params.taskid);      
	res.writeHead(200, {
		'Content-Type': 'text/event-stream', // <- Important headers
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
    res.write('\n');
    moderatorPNETS.subscribe(req,res,req.params.suid)
})

app.post('/assign', (req, res) => {
    console.log("assign: msg :",req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json(moderatorPNETS.assign(req.body));    
})

app.get('/delegate', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(moderatorPNETS.delegate());    
})

const server = http.createServer(app);
server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }

    console.log("DSMEM now running on port", server.address());
});
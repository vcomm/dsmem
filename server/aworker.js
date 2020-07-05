'use strict';

//const express = require('express');
//const http = require('http');
//const app = express();
const EventEmitter = require('events');

class adaptiveWorker extends EventEmitter {
    /* Constructor */
    constructor(cntn) {
        super()
        console.log(`Activate worker: ${cntn}`)      
    } 

    init() {
        const self = this
        process.on('message', function (data) {
            console.log(` | PM2 Worker: recv data request -> ${JSON.stringify(data)}`);
            setImmediate(() => self.emit("request", data.topic, data.data)); 
        });               
        super.on("request", (topic, data) => self.responce(topic, data));  
    }

    responce(topic, data) {
        process.send({
            type : 'process:msg',
            data : {
                pid   : process.pid,
                topic : topic,
                msg   : data
            }            
        });        
    }
}

if (typeof module !== 'undefined' &&
    typeof module.exports !== 'undefined') {
    module.exports.aWORKER = adaptiveWorker
}

const worker = new adaptiveWorker('test')
worker.init()

/*
process.on('message', function (data) {
   console.log(` | PM2 Worker: your actual data object -> ${JSON.stringify(data.data)}`);
   process.send({
      type : 'process:msg',
      data : {
        topic   : data.topic,
        pm_id   : data.id,
        success : true
      }
   });   
});
/*
const PORT = 9500;

app.use(express.static(__dirname+'/public')); 
const server = http.createServer(app);

var template = 
`<!DOCTYPE html> <html> <body>
	<script type="text/javascript">
		document.body.innerHTML = "AWorker: Hello world<br>";
	</script>
</body> </html>`;

app.get('/', function (req, res) {
	res.send(template); // <- Return the static template above
});
server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log(`${Date.now()} | Adaptive worker running on port:`,server.address());
});
*/
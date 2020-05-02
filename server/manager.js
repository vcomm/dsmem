'use strict';

const EventEmitter = require('events');

const execPNETS = (function () {
    let tasks = [];
    let clientId = 0;
    let clients = {}; // <- Keep a map of attached clients    
    const Stream = new EventEmitter(); 
    Stream.on("push", (id, data) => {
        clients[id].res.write("data: " + JSON.stringify(data) + "\n\n");
        console.log("update: monotoring :",data); 
    });

    const template = {
        owner: {
            key  : "nickname",
            color: "orange",
            count: 1,
            places: {
                in: ["P1","P4"],
                out: ["P2"]
            },
            actions: [
                "reference FSM or script name"
            ]  
        }
    }

    function push(interval) {
        return setInterval(() => {
            for (clientId in clients) {
//                Stream.emit("push", clientId, { msg: {id: process.env.INSTANCE_ID,memory:process.memoryUsage()} });
                Stream.emit("push", clientId, { msg: template });
            };
        }, interval);
    }

    return {
        assign: function(json) {
            return {taskID: tasks.push(json)}
        },
        monitor: function(req,res,taskid) {
            (function (clientId) {
                clients[clientId] = { 
                    res : res, // <- Add this client to those we consider "attached"
                    task: taskid,
                    tid : push(3000)
                }
                req.on("close", function () {
                    clearInterval(clients[clientId].tid)
                    delete clients[clientId]
                }); // <- Remove this client when he disconnects
            })(++clientId)            
        }
    }
})()

module.exports = execPNETS
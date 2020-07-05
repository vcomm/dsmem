'use strict';

const pm2 = require('pm2');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

const execPNETS = (function () {
    let tasks = {};
    let clients = {}; // <- Keep a map of attached clients    
    const Stream = new EventEmitter(); 
    Stream.on("push", (id, data) => {
        clients[id].res.write("data: " + JSON.stringify(data) + "\n\n");
        console.log("Update: monotoring :",data); 
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
/*
    function push(interval) {
        return setInterval(() => {
            for (clientId in clients) {
//                Stream.emit("push", clientId, { msg: {id: process.env.INSTANCE_ID,memory:process.memoryUsage()} });
                 Stream.emit("push", clientId, { msg: template });
            };
        }, interval);
    }
*/    
    pm2.connect(function(err) {
        if (err) {
          console.error(err);
          process.exit(2);
        } /*
        pm2.delete('all', function(err) {
            if (err) {
              console.error(err);
              return pm2.disconnect();
            }
            console.log("PM2 delete all app started!");
        }); */  
        pm2.launchBus(function(err, bus) {
            console.log('PM2: Log streaming started.');
            bus.on('process:msg', function(packet) {
                console.log('[App:%s] %s', packet.process.name, JSON.stringify(packet.data))
                Stream.emit("push", tasks[packet.process.name].suid, { msg: packet.data });
            });
        });             
    });
     

    return {
        genuuid: function() {
            const suid = uuidv4()
            if (clients.hasOwnProperty(suid)) {
                execPNETS.genuuid()
            } else {
                return suid
            }
        },
        assign: function(json,suid) {
            const name =  json.prj+json.id  
            tasks[name] = {
                suid: suid,
                json: json
            }            
            pm2.start({
                name      : name,
                script    : 'server/aworker.js'/*,
                kill_timeout : 10000*/
            }, function(err, apps) {
                if (err) throw err
                console.log(`PM2 app started! ${apps[0].name}[${apps[0].pm_id}]`);                            
            });

            return {tname: name, task: tasks[name]}
        },
        execute: function(req,res) {
            pm2.list(function(err, list) {
                list.forEach(function (item, ind) {  
                    console.log(`PM2: ${item.name}[${item.pid}]=${item.pm2_env.pm_id}`)
   
                    pm2.sendDataToProcessId({
                        type : 'process:msg',
                        data : {
                            some : 'data',
                            hello : true
                        },
                        id   : item.pm2_env.pm_id, 
                        topic: 'mytopic'
                    }, function(err, res) {
                        if (err) {
                            console.error(`PM2| sendDataToProcessId  : ${err}`);
                        }
                    });
                                          
                })
            });
            return {status: true}
        },
        subscribe: function(req,res,suid) {
            (function (clientId) {
                clients[clientId] = { 
                    res : res // <- Add this client to those we consider "attached"
                }
                req.on("close", function () {
                    delete clients[clientId]
                    console.log(`Destroy SSE session: ${clientId}`) 
                }); // <- Remove this client when he disconnects
                
                Stream.emit("push", clientId, { subscribe : clientId });
            })(suid)              
/*            
            (function (clientId) {
                clients[clientId] = { 
                    res : res // <- Add this client to those we consider "attached"
                    //task: taskid,
                    //tid : push(5000)
                }
                req.on("close", function () {
                    //clearInterval(clients[clientId].tid)
                    delete clients[clientId]
                    console.log(`Destroy SSE session: ${clientId}`) 
                }); // <- Remove this client when he disconnects
                
                Stream.emit("push", clientId, { msg: { subscribe : clientId} });
            })(++clientId)   
*/                     
        }
    }
})()

module.exports = execPNETS
'use strict';

const buildJSON = (function () {

    let template = {
        "places": [
        {
            "key": "P1",
            "owner": "local",
            "trans": {
            "in": ["T1","T3"],
            "out": ["T2","T4"]
            },
            "markers": 3
        }],
        "trans": [
        {
            "key": "T1",
            "owner": "local",
            "places": {
            "in": ["P1","P4"],
            "out": ["P2"]
            },
            "counts": 1,
            "actions": [
                "reference FSM or script name"
            ]            
        }],
        "owners": {
            "green" : {
                "P1": [
                    "fnAlfa", "fnBeta", "fnGamma"
                ],
                "P2": [
                    "fnDelta", "fnOmega"
                ]
            },
            "blue" : {
                "P3" : [
                    "fnBeta", "fnDelta"
                ]
            }
        },
        "execution" : [
            {
                "owner": "blue",
                "trans": ["P3"]
            },
            {
                "owner": "green",
                "trans": ["P2"]
            }

        ],
        "milestone" :  {
            "places": [
                {"key" : "name", "tokens": 3}
            ]
        }      
    }
    
    return {
        attach: function(model) {
            //console.log("attach trans by owners :",model.trans);
            let trans = model.trans.map((item) => {
                let a = item.split(",");
                let Tname = a[0];
                let Owner = a[3];                
                return { owner: Owner, trans: Tname};
            })
            var owners = trans.reduce(function(own, trn) {
                if (!own.hasOwnProperty(trn.owner)) {
                    own[trn.owner] = { key: "*", api: "*", owner: trn.owner }
                }                    
                if (!own[trn.owner].hasOwnProperty(trn.trans))    
                    own[trn.owner][trn.trans] = []
                return own;
              }, {});
            return owners
        },        
        build: function(pnets) {
            let curr = pnets.model.places.map((item) => {
                let a = item.split(",");
                let place = a[0];
                let token = a[3];                
                return `${place}(${token})`;
            })
            let step = pnets.model.r4run.reduce((stack,item) => {                
                let trarr = []
                let trn = pnets.attach[item.owner][item.trans]
                trarr.push(`${item.owner}`)
                trn.forEach((action) => {                    
                    trarr.push(` => ${item.trans}[${action}]`)
                })
                if(!trn.length) trarr.push(` => ${item.trans}`)
                stack.push(trarr)
                return stack;
            }, [])
            return {curr: curr,step: step}
        }
    }
})()

module.exports = buildJSON
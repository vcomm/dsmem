'use strict';

class pnetsRegulator {
    /* Constructor */
    constructor(model){
        this._model_ = model;
        this._FireList_ = [];
        this._Places_ = {};        
        this._Trans_ = {};
        this._Arcs_  = [];
    }    

    initModel(pnmodel) {
        this.clearAll();
        this._model_ = pnmodel ? pnmodel : this._model_;
        this.initPlace();
        this.initTrans();
        this.initArcs();
    }

    clearAll() {
        this._FireList_ = [];
        this._Places_ = {};        
        this._Trans_ = {};
        this._Arcs_  = [];        
    }

    initPlace() {
        this._model_.places.map((item) => {
            let a = item.split(",");
            this._Places_[a[0]] = {
                place : a[0],
                token : Number(a[3]),
                track : false,
                owner : a[4] 
            }             
        })
    }

    initTrans() {
        this._model_.trans.map((item) => {
            let a = item.split(",");
            this._Trans_[a[0]] = {
                trans : a[0],                
                owner : a[3],
                pass  : false 
            }             
        })
    }

    initArcs() {
        this._model_.arcs.map((item) => {
            let a = item.split(",");
            this._Arcs_.push({from: this.getByKey(a[0]), to: this.getByKey(a[1])})             
        })
    }

    getByKey(key) {
        if (key.charAt(0) == "P")
            return this._Places_[key];
        if (key.charAt(0) == "T")
            return this._Trans_[key];
        return null;
    }

    get_arcsIn(key) {
        let arcsIn = [];
        this._Arcs_.forEach(function (item, index) {
            //console.log(`Get Arc IN by key[${key}]:  ${JSON.stringify(item)}`)
            if (item.to.trans === key) {
                arcsIn.push(item);
            }
        });
        return arcsIn;
    }
    
    get_arcsOut(key) {
        let arcsOut = [];
        this._Arcs_.forEach(function (item, index) {
            //console.log(`Get Arc OUT by key[${key}]:  ${JSON.stringify(item)}`)
            if (item.from.trans === key) {
                arcsOut.push(item);
            }
        });
        return arcsOut;
    }

    ready2Fire() {
        let self = this;
        let step = {
            trans: []
        };

        Object.keys(this._Trans_).forEach(function (key, ind) {    
            let arcsIn = self.get_arcsIn(key);
            let conditionPlaces = arcsIn.filter((item) => {
                if (!item.from.track && item.from.token > 0) {
                    item.from.track = true
                    return item.from.token
                }
            })
            if (arcsIn.length === conditionPlaces.length) {
                step.trans.push(self._Trans_[key])
                //self._Trans_[key].pass = true
                //step.arcsIn  = arcsIn
                //step.arcsOut = self.get_arcsOut(key)
            } else {
                arcsIn.filter((item) => {                    
                    item.from.track = false                   
                })                
            }
        });
        return step;
    }   

    executeTrans(pnets, rlist) {
        let step = rlist.reduce((stack,item) => {                
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
        return step
    }
    
    getConditions() {
        let self = this;
        let curr = [];
        Object.keys(this._Places_).forEach((key) => {          
            curr.push(`${self._Places_[key].place}(${self._Places_[key].token})`)
        })
        return curr 
    }

    placesMarkers(firetransitions) {
        let self = this;

        if (firetransitions && Array.isArray(firetransitions)) {
            firetransitions.map((fire) => {
                let arcsIn = self.get_arcsIn(fire.trans)
                arcsIn.map((place) => {
                    place.from.token--    
                    place.from.track = false           
                })    
                let arcsOut = self.get_arcsOut(fire.trans)
                arcsOut.map((place) => {
                    place.to.token++            
                })            
            }) 
            return true      
        } else { 
            console.error(`ERROR Fire transition:  ${JSON.stringify(firetransitions)}`)
            return false            
        }
    }
      
}

if (typeof module !== 'undefined' &&
    typeof module.exports !== 'undefined') {
    module.exports.mngPNETS = pnetsRegulator
}
/*
// Test

const pnets = {
    "places":[
        "P1,495,212,1,orange",
        "P2,488,326,1,orange",
        "P3,482,451,1,orange",
        "P4,884,332,0,orange"
    ],
    "trans":[
        "T1,681,273,green",
        "T2,673,396,green"
    ],
    "arcs":[
        "P1,T1",
        "P2,T1",
        "T2,P4",
        "P2,T2",
        "T1,P4",
        "P3,T2"
    ]
}

let requlator = new pnetsRegulator
requlator.initModel(pnets)

//console.log(`Places: ${JSON.stringify(requlator._Places_)}`)
//console.log(`Trans: ${JSON.stringify(requlator._Trans_)}`)
//console.log(`Arcs: ${JSON.stringify(requlator._Arcs_)}`)

let trlst = requlator.ready2Fire()
console.log(`Ready to Fire: ${JSON.stringify(trlst)}`)
//console.log(`Place OUT: ${JSON.stringify(requlator.placesMarkers(trlst.arcsOut))}`)
//console.log(`Places: ${JSON.stringify(requlator._Places_)}`)
*/
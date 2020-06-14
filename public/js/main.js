function toolbar_clicked()
{
    unselect();
}

function openNav(x) {
    x.classList.toggle("change");
    let mon  = document.getElementById("accordion");
    let nav  = document.getElementById("jsonTemplate");
//    console.log(nav.style.width);
    if ( nav.style.width == "0px") {
         nav.style.width = "30%";	
         mon.style.height = "250px";
         mon.style.borderStyle = "double";
         attachBIOS(SerializePnet(Places, Trans, Arcs))

         document.getElementById("btnStep").disabled = true;
         document.getElementById("btnRun").disabled  = true;
         document.getElementById("btnStop").disabled = true;         

         document.getElementById("btnPair").disabled = true;
         document.getElementById("btnAddArc").disabled = true;
         document.getElementById("btnAddTrans").disabled = true;
         document.getElementById("btnAddPlace").disabled = true;
         document.getElementById("btnRemoveObj").disabled = true;
         document.getElementById("btnClearPaper").disabled = true;   

         document.getElementById("btnRestoreLocal").disabled = true;     
         document.getElementById("btnFalseInput").disabled = true;        
    } else {	  
         nav.style.width = "0px";	
         mon.style.height = "0px";
         mon.style.borderStyle = "unset";
         document.getElementById("btnStep").disabled = false;
         document.getElementById("btnRun").disabled  = false;
         document.getElementById("btnStop").disabled = false;      
         
         document.getElementById("btnPair").disabled = false;
         document.getElementById("btnAddArc").disabled = false;
         document.getElementById("btnAddTrans").disabled = false;
         document.getElementById("btnAddPlace").disabled = false;
         document.getElementById("btnRemoveObj").disabled = false;
         document.getElementById("btnClearPaper").disabled = false;      
         
         document.getElementById("btnRestoreLocal").disabled = false;
         document.getElementById("btnFalseInput").disabled = false;
    }
}

function attachBIOS(json) {
    let pnets = editor.get()
    pnets.model = JSON.parse(json)
    fetch('/attach', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body:json
    })  
        .then(res => res.json())
        .then(bios => {             
            pnets.attach = bios
            editor.set(pnets)
        })
        .catch(console.error.bind(console));
}

function buildJSON(json,r4run) {
    let pnets = editor.get()
    pnets.model = JSON.parse(json)
    //pnets.model.r4run = r4run    
    editor.set(pnets)
    fetch('/build', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: editor.getText()
    })  
        .then(res => res.json())
        .then(exec => {             
            pnets.execute = exec
            pnets.execute.next = []
            step_clicked(() => {
                Object.keys(Places).forEach(function (key) {
                    pnets.execute.next.push(`${Places[key].key}(${Places[key].tokens.length})`);
                });
                editor.set(pnets)
                //log(JSON.stringify(pnets.execute));    
                backlog(pnets.execute);             
                document.getElementById("btnStepexec").disabled = false;
            })                       
        })
        .catch(console.error.bind(console));
}

function assignJSON() {    
    fetch('/assign', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body:editor.getText()
    })  
        .then(res => res.json())
        .then(json => {
            let pnets = editor.get()
            pnets.task = json.taskID
            editor.set(pnets)
        })
        .catch(console.error.bind(console));
}

function execMonitor() {
      if (!window.EventSource) {
        console.log("Your browser not supported EventSource.");
        return;
      }  
      var source = new EventSource("/execute/"+editor.get().task);
      source.onopen = function(e) {
        console.log("Event: open: ",e);
      };   
      source.onmessage = function(e) {
        console.log("Event: message, data: ",e.data);
        log(e.data);
      };                    
      source.onerror = function(e) {
        console.log("Event: error - ",e);
        if (this.readyState == EventSource.CONNECTING) {
            console.log(`Reconnection (readyState=${this.readyState})...`);
        } else {
            console.log("Reconnection error");
        }
      };   
      return source
}

function destroyMonitor() {
    monitor.close();
    console.log("Destroy execution monitoring");
}

function log(msg) {
    $("#accordion")
        .append(`<a href="#!" class="list-group-item list-group-item-action">${msg}</a>`)
        .scrollTop(250);
//    const elem = document.getElementById("Monitor")
//    elem.innerHTML += msg + "<br>";
//    elem.scrollIntoView(false);
//    document.documentElement.scrollTop = 99999999;    
}

function backlog(msg) {
    var dt = new Date()
    dt = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()
    var count = parseInt($("#accordion").attr("count"))+1
    $("#accordion")
    .append(`
    <div class="card">
        <div class="card-header" role="tab" id="heading${count}">
        <h5 class="mb-0">
            <a data-toggle="collapse" href="#collapse${count}" aria-expanded="true" aria-controls="collapse${count}">
            ${dt} | STEP-${count}: [${msg.curr.toString()}] => [${msg.next.toString()}]
            </a>
        </h5>
        </div>
        <div id="collapse${count}" class="collapse" role="tabpanel" aria-labelledby="heading${count}">
        <div class="card-body">
                    ${printlist(msg.step)}
        </div>
        </div>
    </div>`)
    .attr("count",`${count}`)
    .scrollTop(250);    
}

function printlist(list) {
    var ret = ``
    jQuery.each( list, function( i, val ) {  
        if (Array.isArray(val)) {
            ret += printlist(val)
        } else {      
            if(i > 0) ret +=`<li>${val}</li>`
            else      ret += `<ul style="color:${val}">`
        }
      });        
    ret +=`</ul>`
    return ret
}

function initJSONeditor(id) {
    // JSON Editor
    var container = document.getElementById(id);
    var options = {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
        onError: function (err) {
            alert(err.toString());
        },
        onModeChange: function (newMode, oldMode) {
            console.log('Mode switched from', oldMode, 'to', newMode);
        }
    };
    var pnets = {
        "id": "template",
        "type": "PNETS",
        "prj": "proj_"
        /*,
        "model": {"places":["P1,414,205,0","P2,820,206,0","P3,418,409,1","P4,555,488,0","P5,819,419,1"],"trans":["T1,323,306","T2,302,489","T3,723,309","T4,698,467"],"arcs":["P1,T1","T1,P3","P3,T2","T2,P4","P4,T3","P2,T3","T3,P5","P5,T4","T2,P1","T4,P2"]},
        "execute": {
            "places": [
            {
                "key": "P1",
                "owner": "local",
                "trans": {
                "in": ["T1","T3"],
                "out": ["T2","T4"]
                },
                "markers": 3
            }
            ],
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
            }
            ]
        },
        "monitor":{}
*/        
      };

    editor = new JSONEditor(container, options, pnets);    
}

var editor = null;
var paper = null;
var monitor = null;

function onload() {
    set_paper();

    $('#pickerColor li > a').click(function () { ColorPicker($(this).css( "color" )); });    
    ini_button("btnAssign", function () { assignJSON(); }, "Assignment actions to Petri Net graph");
    ini_button("btnStepexec", function () { this.disabled = true; buildJSON(SerializePnet(Places, Trans, Arcs),ready2Fire([])) }, "Step Forward Execution Petri Net graph");
    ini_button("btnExecute", function () { monitor = execMonitor(); }, "Execute Petri Net graph");
    ini_button("btnDestroy", function () { destroyMonitor(); }, "Desctroy Petri Net monitoring");        
    ini_button("btnPair", function () { NewPair(); this.disabled = true; }, "Pairing");
    ini_button("btnAddArc", function () { NewArc(); this.disabled = true; }, "Add Arc");
    ini_button("btnAddTrans", function () { NewTransition(35, 45); }, "Add transition node");
    ini_button("btnAddPlace", function () { NewPlace(35, 45); }, "Add place node");
    ini_button("btnRemoveObj", function () { RemoveObject(); }, "Remove selected object");
    ini_button("btnClearPaper", function () { clear_paper(); }, "Clear canvas");
    ini_button("btnStep", function () { this.disabled = true; step_clicked(()=>{document.getElementById("btnStep").disabled = false;}); }, "Step running modeling Petri Net graph");
    ini_button("btnRun", function () { run_clicked(); }, "Run modeling Petri Net graph");
    ini_button("btnStop", function () { stop_clicked(); }, "Stop running modeling Petri Net graph");
    ini_button("btnSaveLocal", function () { save_local(); }, "Save to local memory");
    ini_button("btnRestoreLocal", function () { restore_local(); }, "Restore from local memory");
    ini_button("btnFalseInput", function () { open_clicked(); }, "Open from file");
    ini_button("btnDownload", function () { save_toFile(); }, "Download as file");
    ini_button("btnTokenAdd", function () { token_add(); }, "Add token to selected place");
    ini_button("btnTokenRemove", function () { token_remove(); }, "Remove token from selected place");
//    ini_button("btnTrnTurn", function () { rectancle_turn(); }, "Transition turn 90");
    ini_button("Example1", function () { load_example(1); }, "Example 1");
    ini_button("Example2", function () { load_example(2); }, "Example 2");
    ini_button("Example3", function () { load_example(3); }, "Example 3");
    ini_button("Example4", function () { load_example(4); }, "Example 4");
    ini_button("Example5", function () { load_example(5); }, "Example 5");
    ini_button("Example6", function () { load_example(6); }, "Critical section");
    ini_button("Example7", function () { load_example(7); }, "Dining philosopher");
    var elem = null;
    elem = document.getElementById("selected_label");
    elem.onmouseover = function () { set_status("Displays selected object (click to unselect)"); };
    elem.onmouseout = function () { set_status(""); };
    /*
    elem = document.getElementById("logo_link");
    elem.onmouseover = function () { set_status("Home page"); };
    elem.onmouseout = function () { set_status(""); };
    */
    //var btn = document.getElementById("btnToggle");
    //btn.onclick = function () {
    //    var tb = document.getElementById("toolbox");
    //    tb.innerHTML = "Events<br>Events<br>Events<br>Events<br>Events<br>";
    //    tb.width = "500px";
    //};

    initJSONeditor("jsoneditor")
}
function ini_button(id, onclick, tooltip)
{
    var btn = document.getElementById(id);
    btn.onclick = onclick;
    btn.onmouseover = function () { set_status(tooltip); };
    btn.onmouseout = function () { set_status(""); };
}
function open_clicked() {
    if (IsRunning) {
        StopRun();
        set_default_icon();
        unlock_status();
        set_status("");
    }
    document.getElementById('fileinput').click();
}
function set_paper() {
    var center_row = document.getElementById("center_row");
    paper = new Raphael("center_row");
    PAPER_WIDTH = center_row.offsetWidth;
    PAPER_HEIGHT = center_row.offsetHeight;
    paper_initialize();
}
function clear_paper() {
    ResetPnet();
    paper.clear();
    paper_initialize();
}
function body_onresize() {
    if (paper != null) {
        var text = SerializePnet(Places, Trans, Arcs);
        localStorage.setItem("paper_temp", text);
        paper.remove();
        set_paper();
        var pn = JSON.parse(localStorage.getItem("paper_temp"));
        DeserializePnet(pn);
    }
    //set_status("Resizing...");
}
function paper_initialize()
{
    set_status("Ready");
    //paper.rect(0, 0, PAPER_WIDTH, PAPER_HEIGHT).attr({ "stroke-width": "4", "stroke": "red", "fill": "white" });
}
function step_clicked(cblk) {
    if (graph_loaded()) {
        set_run_icon();
        set_status("Step Over Running...");
        lock_status();
        StartRun(cblk);
    }
    else
    {
        set_status("No valid graph loaded.");
    }    
}
function run_clicked() {
    //console.log("graph_loaded=" + graph_loaded());
    if (graph_loaded()) {
        set_run_icon();
        set_status("Running...");
        lock_status();
        StartRun();
    }
    else
    {
        set_status("No valid graph loaded.");
    }
}
function set_run_icon()
{
    document.getElementById("status_icon").className = "fa fa-cog fa-spin";
}
function set_default_icon() {
    document.getElementById("status_icon").className = "fa fa-caret-right";
}
function stop_clicked() {
    if (IsRunning) {
        set_default_icon();
        unlock_status();
        set_status("Stopped.");
        StopRun();
    }
    else {
        set_status("There is no running graph.");
    }
}
function restore_local() {
    clear_paper();
    RestoreFromLocalStorage();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function token_add() {
    if (Selected != null && Selected.node.key.substr(0, 1) == "P") {
        AddToken(Places[Selected.node.key]);
    }
    else {
        set_status("No selected placed.");
    }
}
function token_remove() {
    if (Selected != null && Selected.node.key.substr(0, 1) == "P") {
        RemoveToken(Places[Selected.node.key]);
    }
    else {
        set_status("No selected placed.");
    }
}
function save_toFile() {
    SaveToFile("pnet.txt")

}
// Usage!
function load_example(i) {
    if (IsRunning) {
        //StopRun();
        //sleep(1100).then(() => {
        //    load_example(i);
        //});
    }
    else
    {
        var pn = [];
        pn[1] = { "places": ["P1,74,215,0", "P2,75,294,1", "P3,77,382,1", "P4,303,254,0", "P5,301,341,0", "P6,303,187,0", "P7,387,372,0", "P8,610,318,0", "P9,385,455,0"], "trans": ["T1,183,247", "T2,182,333", "T3,181,160", "T4,182,417", "T5,425,194", "T6,494,452"], "arcs": ["P1,T1", "P2,T1", "P2,T2", "P3,T2", "T1,P4", "T2,P5", "T1,P2", "T2,P2", "P5,T3", "T3,P1", "P4,T4", "T4,P3", "T1,P6", "P6,T5", "T5,P7", "P7,T4", "T5,P8", "P8,T6", "T6,P9", "P9,T4"] };
        pn[2] = { "places": ["P1,305,245,2", "P2,323,107,0", "P3,510,106,0"], "trans": ["T1,217,104", "T2,409,177", "T3,416,55"], "arcs": ["P1,T1", "T1,P2", "T3,P3", "P3,T2", "P2,T3", "P2,T2", "T2,P1", "T2,P1"] };
        pn[3] = { "places": ["P1,383,303,1", "P2,384,219,1", "P3,385,147,1", "P4,632,218,1"], "trans": ["T1,497,301", "T2,497,224", "T4,495,151"], "arcs": ["P1,T1", "P2,T2", "P4,T1", "T4,P4", "T4,P1", "T4,P2", "T4,P3", "T1,P4", "T2,P4", "P4,T2", "P3,T4", "P4,T4"] };
        pn[4] = { "places": ["P1,78,186,1", "P2,75,296,1", "P3,82,395,1", "P4,301,148,0", "P5,310,442,0", "P6,306,246,0", "P7,307,339,0"], "trans": ["T1,186,238", "T2,188,342", "T3,186,153", "T4,188,443"], "arcs": ["P1,T1", "P2,T1", "P2,T2", "P3,T2", "T1,P4", "T2,P5", "T2,P2", "T1,P2", "T2,P6", "P6,T3", "P4,T3", "T3,P1", "T1,P7", "P7,T4", "T4,P3", "P5,T4"] };
        pn[5] = { "places": ["P1,440,90,1", "P2,531,65,1", "P3,617,44,1", "P4,536,344,1", "P5,303,189,0", "P6,537,194,0", "P7,766,188,0"], "trans": ["T1,210,189", "T2,446,191", "T3,683,191", "T4,877,186", "T5,614,191", "T6,382,188"], "arcs": ["P1,T1", "P2,T2", "P3,T3", "P4,T1", "P4,T2", "P4,T3", "T1,P5", "T2,P6", "T3,P7", "P7,T4", "P6,T5", "P5,T6", "T6,P4", "T5,P4", "T4,P4", "T4,P1", "T4,P2", "T4,P3"] };
        pn[6] = { "places": ["P1,735,325,1,orange","P2,369,321,0,orange","P3,372,175,1,orange","P4,360,485,0,orange","P5,1143,338,0,orange","P6,1145,164,1,orange","P7,1131,497,0,orange"],"trans":["T1,554,263,#71ed58","T2,552,391,#71ed58","T3,941,271,#ed53eb","T4,940,409,#ed53eb","T5,1368,341,#ed53eb","T6,159,308,#ed53eb"],"arcs":["T1,P2","T2,P1","P1,T1","P2,T2","T2,P4","P1,T3","T4,P1","P5,T4","T3,P5","T4,P7","P3,T1","P6,T3","P7,T5","T5,P6","T6,P3","P4,T6"]};
        pn[7] = { "places": ["P1,867,230,0,#71ed58","P2,1001,231,1,#71ed58","P3,862,776,1,#53a3ed","P4,1010,780,0,#53a3ed","P5,499,437,0,#ed53eb","P6,498,559,1,#ed53eb","P7,1374,429,1,#f54f4c","P8,1379,562,0,#f54f4c","P9,516,235,1,orange","P10,1365,224,1,orange","P11,499,771,1,orange","P12,1383,783,1,orange"],"trans":["T1,934,140,#71ed58","T2,935,317,#71ed58","T3,940,669,#53a3ed","T4,939,896,#53a3ed","T5,621,487,#ed53eb","T6,383,489,#ed53eb","T7,1258,492,#f54f4c","T8,1499,488,#f54f4c"],"arcs":["T1,P1","T2,P2","P1,T2","P2,T1","T3,P3","P3,T4","T4,P4","P4,T3","P5,T6","T6,P6","P6,T5","T5,P5","T7,P8","P8,T8","T8,P7","P7,T7","T1,P9","T1,P10","P10,T2","P9,T2","P9,T5","T6,P9","T6,P11","P11,T5","T8,P10","T8,P12","P12,T7","P12,T3","P10,T7","T4,P11","T4,P12","P11,T3"]}; 
        clear_paper();
        DeserializePnet(pn[i]);
    }
}
function restore_fromFile() {
    //reset_workspace();
    if (IsRunning)
    {
        StopRun();
    }
    clear_paper();
    var file = document.getElementById("fileinput").files[0];
    ReadFromFile(file, function (event) {
        try
        {
            var pn = JSON.parse(event.target.result);
            DeserializePnet(pn);
        }
        catch(err)
        {
            console.log(err.message);
        }
    });
}
function save_local() {
    SaveToLocalStorage()
}
function page_onload() {
    //RestoreSettings();
    paper = Raphael(10, 50, PAPER_WIDTH, PAPER_HEIGHT);
    reset_workspace();
}

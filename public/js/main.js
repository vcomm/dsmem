function toolbar_clicked()
{
    unselect();
}

var paper = null;

function onload() {
    set_paper();
    ini_button("btnPair", function () { NewPair(); this.disabled = true; }, "Pairing");
    ini_button("btnAddArc", function () { NewArc(); this.disabled = true; }, "Add Arc");
    ini_button("btnAddTrans", function () { NewTransition(35, 45); }, "Add transition node");
    ini_button("btnAddPlace", function () { NewPlace(35, 45); }, "Add place node");
    ini_button("btnRemoveObj", function () { RemoveObject(); }, "Remove selected object");
    ini_button("btnClearPaper", function () { clear_paper(); }, "Clear canvas");
    ini_button("btnRun", function () { run_clicked(); }, "Run Petri Net graph");
    ini_button("btnStop", function () { stop_clicked(); }, "Stop running");
    ini_button("btnSaveLocal", function () { save_local(); }, "Save to local memory");
    ini_button("btnRestoreLocal", function () { restore_local(); }, "Restore from local memory");
    ini_button("btnFalseInput", function () { open_clicked(); }, "Open from file");
    ini_button("btnDownload", function () { save_toFile(); }, "Download as file");
    ini_button("btnTokenAdd", function () { token_add(); }, "Add token to selected place");
    ini_button("btnTokenRemove", function () { token_remove(); }, "Remove token from selected place");
    ini_button("Example1", function () { load_example(1); }, "Example 1");
    ini_button("Example2", function () { load_example(2); }, "Example 2");
    ini_button("Example3", function () { load_example(3); }, "Example 3");
    ini_button("Example4", function () { load_example(4); }, "Example 4");
    ini_button("Example5", function () { load_example(5); }, "Example 5");
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

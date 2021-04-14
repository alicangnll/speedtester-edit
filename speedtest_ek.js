function I(i){return document.getElementById(i);}

var SPEEDTEST_SERVERS="https://alicangnll.github.io/speedtester-edit/speed/speedtest.php";


var s=new Speedtest();


function initServers(){
    var noServersAvailable=function(){
        I("message").innerHTML="No servers available / Server bulunamadı";
    }
    var runServerSelect=function(){
        s.selectServer(function(server){
            if(server!=null){
                I("loading").className="hidden";
                
                for(var i=0;i<SPEEDTEST_SERVERS.length;i++){
                    if(SPEEDTEST_SERVERS[i].pingT==-1) continue;
                    var option=document.createElement("option");
                    option.value=i;
                    console.log("" + SPEEDTEST_SERVERS[i].name + " OK");
                    option.textContent=SPEEDTEST_SERVERS[i].name;
                    if(SPEEDTEST_SERVERS[i]===server) option.selected=true;
                    I("server").appendChild(option);
                }
                //show test UI
                I("testWrapper").className="visible";
                updateSponsor();
                initUI();
            }else{ 
                noServersAvailable();
                console.log("Servers DOWN");
            }
        });
    }
    if(typeof SPEEDTEST_SERVERS === "string"){

        s.loadServerList(SPEEDTEST_SERVERS,function(servers){
            if(servers==null){ 
                noServersAvailable();
            }else{
                SPEEDTEST_SERVERS=servers;
                runServerSelect();
            }
        });
    }else{
        //hardcoded server list
        s.addTestPoints(SPEEDTEST_SERVERS);
        runServerSelect();
    }
}

var meterBk=/Trident.*rv:(\d+\.\d+)/i.test(navigator.userAgent)?"#EAEAEA":"#80808040";
var dlColor="#6060AA",
	ulColor="#616161";
var progColor=meterBk;


function drawMeter(c,amount,bk,fg,progress,prog){
	var ctx=c.getContext("2d");
	var dp=window.devicePixelRatio||1;
	var cw=c.clientWidth*dp, ch=c.clientHeight*dp;
	var sizScale=ch*0.0055;
	if(c.width==cw&&c.height==ch){
		ctx.clearRect(0,0,cw,ch);
	}else{
		c.width=cw;
		c.height=ch;
	}
	ctx.beginPath();
	ctx.strokeStyle=bk;
	ctx.lineWidth=12*sizScale;
	ctx.arc(c.width/2,c.height-58*sizScale,c.height/1.8-ctx.lineWidth,-Math.PI*1.1,Math.PI*0.1);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle=fg;
	ctx.lineWidth=12*sizScale;
	ctx.arc(c.width/2,c.height-58*sizScale,c.height/1.8-ctx.lineWidth,-Math.PI*1.1,amount*Math.PI*1.2-Math.PI*1.1);
	ctx.stroke();
	if(typeof progress !== "undefined"){
		ctx.fillStyle=prog;
		ctx.fillRect(c.width*0.3,c.height-16*sizScale,c.width*0.4*progress,4*sizScale);
	}
}

function mbpsToAmount(s){
	return 1-(1/(Math.pow(1.3,Math.sqrt(s))));
}
function format(d){
    d=Number(d);
    if(d<10) return d.toFixed(2);
    if(d<100) return d.toFixed(1);
    return d.toFixed(0);
}


var uiData=null;
function startStop(){
    if(s.getState()==3){
		//speedtest is running, abort
		s.abort();
		data=null;
		I("startStopBtn").className="";
		I("server").disabled=false;
		initUI();
	}else{
		//test is not running, begin
		I("startStopBtn").className="running";
		
		I("server").disabled=true;
		s.onupdate=function(data){
            uiData=data;
		};
		s.onend=function(aborted){
            I("startStopBtn").className="";
            I("server").disabled=false;
            updateUI(true);
            if(!aborted){
                //if testId is present, show sharing panel, otherwise do nothing
                try{
                    var testId=uiData.testId;
                    if(testId!=null){
                        I("testId").innerHTML=testId;
                        I("shareArea").style.display="";
                    }
                }catch(e){}
            }
		};
		s.start();
	}
}

function updateUI(forced){
	if(!forced&&s.getState()!=3) return;
	if(uiData==null) return;
	var status=uiData.testState;
	if(status == "4") {
	document.getElementById("shareArea").innerHTML = '<b>Test finished / Test bitti</b>';
	} else {
	document.getElementById("shareArea").innerHTML = '<div data-role="stepper" data-steps="4" data-step="' + status +'"></div>';
	}
	I("ip").textContent=uiData.clientIp;
	I("dlText").textContent=(status==1&&uiData.dlStatus==0)?"...":format(uiData.dlStatus);
	drawMeter(I("dlMeter"),mbpsToAmount(Number(uiData.dlStatus*(status==1?oscillate():1))),meterBk,dlColor,Number(uiData.dlProgress),progColor);
	I("ulText").textContent=(status==3&&uiData.ulStatus==0)?"...":format(uiData.ulStatus);
	drawMeter(I("ulMeter"),mbpsToAmount(Number(uiData.ulStatus*(status==3?oscillate():1))),meterBk,ulColor,Number(uiData.ulProgress),progColor);
	I("pingText").textContent=format(uiData.pingStatus);
	I("jitText").textContent=format(uiData.jitterStatus);
	var ping = document.getElementById("pingText").textContent;
	var dltext = document.getElementById("dlText").textContent;
	var ultext = document.getElementById("ulText").textContent;
	var jitter = document.getElementById("jitText").textContent;
	if(jitter < 5) {
	document.getElementById("jitText").style.color = "green";
	} else {
	document.getElementById("jitText").style.color = "#616161";
	}
	if(ping < "80") {
		document.getElementById("pingText").style.color = "green";
	} else if(ping > "100") {
		document.getElementById("pingText").style.color = "red";
	} else {
		document.getElementById("pingText").style.color = "#616161";
	}

	if(dltext < "2.00") {
		document.getElementById("dlText").style.color = "red";
	} else if(dltext > "4.00") {
		document.getElementById("dlText").style.color = "green";
	} else {
		document.getElementById("dlText").style.color = "#616161";
	}
	
	if(ultext < "1.00") {
		document.getElementById("ulText").style.color = "red";
	} else if(ultext > "2.00") {
		document.getElementById("ulText").style.color = "green";
	} else {
		document.getElementById("ulText").style.color = "#616161";
	}
}
function oscillate(){
	return 1+0.02*Math.sin(Date.now()/100);
}

window.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||(function(callback,element){setTimeout(callback,1000/60);});
function frame(){
	requestAnimationFrame(frame);
	updateUI();
}
frame();

function initUI(){
	drawMeter(I("dlMeter"),0,meterBk,dlColor,0);
	drawMeter(I("ulMeter"),0,meterBk,ulColor,0);
	I("dlText").textContent="";
	I("ulText").textContent="";
	I("pingText").textContent="";
	I("jitText").textContent="";
	I("ip").textContent="";
}
function updateSponsor(){
}

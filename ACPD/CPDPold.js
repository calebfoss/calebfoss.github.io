var rABS = typeof FileReader !== 'undefined' && FileReader.prototype && FileReader.prototype.readAsBinaryString;

var filePath = 'MasterDatabase12-7-15vF.xlsx';
var xhr = new XMLHttpRequest();
var wb;
xhr.open("GET", filePath, true);
xhr.overrideMimeType('text\/plain; charset=x-user-defined');

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
		console.log("Checkpoint 2");
	} else {
		document.getElementById("text").innerHTML += "Geolocation is not supported by this browser.";
	}
}

function showPosition(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	console.log("Checkpoint 3");
	findClosest(lat, lon); 
}

function findClosest(lat, lon){
	var cellAddress = {c:1,r:1};
	var sheetName = wb.SheetNames[2];
	var sheet = wb.Sheets[sheetName];
	var range = XLSX.utils.decode_range(sheet['!ref']);
	var numRows = range.e.r;
	console.log("Checkpoint 4");
	for(var i = 0; i < numRows; i++){
		var latAddress = {c:1,r:1};
	}
}

xhr.onload = function(e) {
	var data = xhr.responseText;
    // dummyObject
    var f = new File([], 'sample.xlsx', {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

    var reader = new FileReader();
    reader.onload = function(e) {
    	var projectTime = {};
    	wb = XLSX.read(data, {type: 'binary'});
    	document.getElementById("text").innerHTML += wb.SheetNames[0];
    	console.log("Checkpoint 1");
    	getLocation();
        // do something
    };
    reader.readAsBinaryString(f);
};
xhr.send(null);


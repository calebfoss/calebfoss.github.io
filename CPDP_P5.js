var capture;

function setup(){
	createCanvas(windowWidth, windowHeight);
capture = createCapture({
	video: {deviceId: 'camera 0, facing back'}});
}

function draw(){
	image(capture,0,0)
}
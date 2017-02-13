var capture;

function setup(){
	createCanvas(windowWidth, windowHeight);
capture = createCapture({
	video: {facingMode:{exact: 'environment'}}});
}

function draw(){
	image(capture,0,0)
}
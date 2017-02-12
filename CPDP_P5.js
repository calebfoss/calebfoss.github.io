var capture;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  //capture.size(320, 240);
  capture.hide();
}

function draw() {
  image(capture, 0, 0, width, width*capture.height/capture.width);
}
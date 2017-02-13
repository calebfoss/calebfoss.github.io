var capture;

function setup() {
  createCanvas(480, 120);
  var constraints = {
    video: {
        facingMode: "environment"
  }
  };
  capture = createCapture(constraints, function(stream) {
    console.log(stream);
  });
}

function draw(){
	image(capture,0,0)
}
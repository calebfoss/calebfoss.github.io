var capture;

function setup() {
  createCanvas(windowWidth, windowHeight);
  var constraints = {
    video: {
       	facingMode: {
        	exact: "environment"
      }
    },
  };
  capture = createCapture(constraints, function(stream) {
    console.log(stream);
  });
  //capture.size(320, 240);
  capture.hide();
}

function draw() {
  image(capture, 0, 0, width, width*capture.height/capture.width);
}
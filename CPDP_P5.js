var capture;

function setup() {
  createCanvas(390, 240);
  capture = createCapture(createCapture({
    audio: false,
    video: {
      facingMode: {
        exact: "environment"
      }
    }
  });
  //blah blah
  capture.size(320, 240);
  //capture.hide();
}

function draw() {
  background(255);
  image(capture, 0, 0, 320, 240);
  filter('INVERT');
}
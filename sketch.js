let textInput, flagInput, formatInput, saveButton;
let mainCanvas, favCanvas;
let titleSpans;

function setup() {
  const header = createElement("header");
  const title = createElement("h1");
  const titleText = "Queer Flag Encoder";
  titleSpans = [...titleText].map((c) => {
    const span = createSpan(c);
    span.parent(title);
    span.class("title");
    return span;
  });
  title.parent(header);

  const appContainer = createElement("div");
  appContainer.class("app");

  mainCanvas = createCanvas(400, 400);
  mainCanvas.parent(appContainer);
  favCanvas = createGraphics(16, 16);

  background(0);
  noStroke();

  const controls = createDiv();
  controls.class("controls");
  controls.parent(appContainer);

  const textLabel = createElement(
    "label",
    "Type your name or any word/phrase you'd like to encode"
  );
  textLabel.attribute("for", "encoding text");
  textLabel.parent(controls);
  textInput = createInput();
  textInput.input(redraw);
  textInput.id("encoding text");
  textInput.parent(controls);
  textInput.elt.focus();

  const flagLabel = createElement(
    "label",
    "Select the flag for the color palette"
  );
  flagLabel.attribute("for", "flag");
  flagLabel.parent(controls);
  flagInput = createSelect();
  flagInput.id("flag");
  flagInput.changed(redraw);
  Object.keys(flags).forEach((flag) => flagInput.option(flag));
  flagInput.parent(controls);

  const formatLabel = createElement(
    "label",
    "Select the format for the color bars"
  );
  formatLabel.attribute("for", "format");
  formatLabel.parent(controls);
  formatInput = createSelect();
  formatInput.changed(redraw);
  Object.keys(formats).forEach((format) => formatInput.option(format));
  formatInput.parent(controls);

  saveButton = createButton("save");
  saveButton.mousePressed(() =>
    save(`${textInput.value()}_${flagInput.value()}_${formatInput.value()}.jpg`)
  );
  saveButton.parent(controls);

  const footer = createElement("footer", "Caleb Foss, 2021");

  noLoop();
  redraw();
}

function draw() {
  const flag = flags[flagInput.value()];
  const encoded = textInput
    .value()
    .split("")
    .map((c) => c.charCodeAt(0).toString(flag.length))
    .join("")
    .split("");
  const { length: encodedLength } = encoded;
  const format = formatInput.value();
  const args = formats[format].getArgs(encodedLength);
  encoded.forEach((val, i) => formats[format].draw({ flag, val, i, ...args }));
  favCanvas.image(mainCanvas, 0, 0, 16, 16);
  document.querySelector("#favicon").href = favCanvas.elt.toDataURL(
    "image/png"
  );
  const {length: flagLength} = flag;
  titleSpans.forEach((span, i) => {
    span.style("color", flag[i % flagLength]);
  });
}

const setColor = (flag, val) => {
  const colorIndex = int(val);
  fill(flag[colorIndex]);
  stroke(flag[colorIndex]);
};

const formats = {
  "horizontal stripes": {
    getArgs: (encodedLength) => ({
      stripeHeight: height / encodedLength,
    }),
    draw: ({ flag, val, i, stripeHeight }) => {
      setColor(flag, val);
      rect(0, i * stripeHeight, width, stripeHeight);
    },
  },
  "vertical stripes": {
    getArgs: (encodedLength) => ({
      stripeWidth: width / encodedLength,
    }),
    draw: ({ flag, val, i, stripeWidth }) => {
      setColor(flag, val);
      rect(i * stripeWidth, 0, stripeWidth, height);
    },
  },
  grid: {
    getArgs: (encodedLength) => {
      const factors = new Array(encodedLength)
        .fill(0)
        .map((val, i) => i)
        .filter((val) => encodedLength % val === 0);
      const hDim = factors[floor(factors.length / 2)];
      const vDim = encodedLength / hDim;
      const cellWidth = width / hDim;
      const cellHeight = height / vDim;
      return { hDim, vDim, cellWidth, cellHeight };
    },
    draw: ({ flag, val, i, hDim, vDim, cellWidth, cellHeight }) => {
      setColor(flag, val);
      const x = (i % hDim) * cellWidth;
      const y = floor(i / hDim) * cellHeight;
      rect(x, y, cellWidth, cellHeight);
    },
  },
};

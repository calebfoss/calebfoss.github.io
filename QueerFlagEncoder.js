let textInput, flagInput, configInput, hDirInput, vDirInput, saveButton;
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

  background(0);
  noStroke();

  const controls = createDiv();
  controls.class("controls");
  controls.parent(appContainer);

  const controlTitle = createElement("h2", "Controls");
  controlTitle.parent(controls);

  const textLabel = createElement(
    "label",
    "Type your name or any word/phrase you'd like to encode."
  )
    .attribute("for", "encoding text")
    .parent(controls);
  textInput = createInput();
  textInput.input(redraw);
  textInput.id("encoding text");
  textInput.parent(controls);
  textInput.elt.focus();

  const flagLabel = createElement(
    "label",
    "Select the flag for the color palette.\nHold control/command to select multiple."
  )
    .attribute("for", "flag")
    .parent(controls);
  flagInput = createSelect(true).id("flag").changed(redraw).parent(controls);
  Object.keys(flags).forEach((flag) => flagInput.option(flag, flag));
  flagInput.selected("LGBTQ rainbow");

  const configLabel = createElement("label", "Configuration")
    .attribute("for", "config")
    .parent(controls);
  configInput = createSelect().id("config").changed(redraw).parent(controls);
  Object.keys(configs).forEach((config) => configInput.option(config));

  const hDirLabel = createElement("label", "Horizontal direction");
  hDirLabel.attribute("for", "hdir");
  hDirLabel.parent(controls);
  hDirInput = createSelect().id("hdir").parent(controls).input(redraw);
  hDirInput.option("left to right", 1);
  hDirInput.option("right to left", -1);

  const vDirLabel = createElement("label", "Vertical direction");
  vDirLabel.attribute("for", "vdir");
  vDirLabel.parent(controls);
  vDirInput = createSelect().id("vdir").parent(controls).input(redraw);
  vDirInput.option("top to bottom", 1);
  vDirInput.option("bottom to top", -1);

  saveButton = createButton("download image");
  saveButton.mousePressed(() =>
    save(
      `${textInput
        .value()
        .slice(0, 10)}_${flagInput.value()}_${configInput.value()}.jpg`
    )
  );
  saveButton.parent(controls);

  const canvasDim = min(document.body.clientWidth, 200 * pixelDensity());
  mainCanvas = createCanvas(canvasDim, canvasDim);
  mainCanvas.style("padding", "1em");
  mainCanvas.parent(appContainer);
  favCanvas = createGraphics(16, 16);

  const exContainer = createDiv();
  exContainer.class("explanation");
  exContainer.parent(appContainer);
  const how = createElement("h2", "How does it work?");
  how.parent(exContainer);
  const explanation = [
    createP(
      "First the text is split into individual characters. Next each character is translated into its numerical character code. For example, the letter Q translates to 81."
    ),
    createP(
      "Then each number is translated using the number of colors in the selected flag. The non-binary flag, for example, has 4 colors, so for this flag 81 translates to 1101 in base 4."
    ),
    createP(
      "After that, each digit is mapped to the corresponding color in the selected flag. The resulting colors are displayed in the selected configuration and orientation."
    ),
  ];
  explanation.forEach((p) => p.parent(exContainer));

  const footer = createElement("footer");
  const link = createA("/", "Caleb Foss");
  link.parent(footer);
  footer.html(", 2021", true);

  noLoop();
  redraw();
}

function draw() {
  const palette = new Array()
    .concat(
      ...Array.from(flagInput.elt.options)
        .filter((option) => option.selected)
        .map((option) => flags[option.value])
    )
    .filter((c, i, arr) => !arr.slice(0, i).some((other) => c === other));
  const { length: paletteLength } = palette;
  const encoded = textInput
    .value()
    .split("")
    .reduce(
      (result, c) =>
        result.concat(...numberToBase(c.charCodeAt(0), paletteLength)),
      []
    );
  const { length: encodedLength } = encoded;
  const config = configInput.value();
  const hDir = int(hDirInput.value());
  const vDir = int(vDirInput.value());
  translate(width / 2, height / 2);
  scale(hDir, vDir);
  translate(-width / 2, -height / 2);
  const args = configs[config].getArgs(encodedLength);
  encoded.forEach((val, i) =>
    configs[config].draw({
      palette,
      val,
      i,
      ...args,
    })
  );
  favCanvas.image(mainCanvas, 0, 0, 16, 16);
  document.querySelector("#favicon").href = favCanvas.elt.toDataURL(
    "image/png"
  );
  titleSpans.forEach((span, i) => {
    span.style("color", palette[i % paletteLength]);
  });
}

const numberToBase = (num, base) =>
  new Array(ceil(log(num) / log(base)))
    .fill(0)
    .map((_, i, { length }) => floor(num / pow(base, length - 1 - i)) % base);

const setColor = (palette, val) => {
  fill(palette[val]);
  stroke(palette[val]);
};

const configs = {
  "horizontal stripes": {
    getArgs: (encodedLength) => ({
      stripeHeight: height / encodedLength,
    }),
    draw: ({ palette, val, i, stripeHeight, vDir }) => {
      setColor(palette, val);
      rect(0, i * stripeHeight, width, stripeHeight);
    },
  },
  "vertical stripes": {
    getArgs: (encodedLength) => ({
      stripeWidth: width / encodedLength,
    }),
    draw: ({ palette, val, i, stripeWidth, hDir }) => {
      setColor(palette, val);
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
    draw: ({
      palette,
      val,
      i,
      hDim,
      vDim,
      cellWidth,
      cellHeight,
      hDir,
      vDir,
    }) => {
      setColor(palette, val);
      const x = (i % hDim) * cellWidth;
      const y = floor(i / hDim) * cellHeight;
      rect(x, y, cellWidth, cellHeight);
    },
  },
};

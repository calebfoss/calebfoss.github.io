/* globals font */
// ----------------------------------------------------
//    POEM SETUP
// ----------------------------------------------------
const substances = [
  "Blood",
  "A series of electric signals",
  "Food",
  "Oxygen",
  "Saliva",
  "Mucus",
  "Urine",
];
const verbs = ["pulses", "flows", "drains"];
const bodyParts = [
  "eyeball",
  "pinky toe",
  "small intestine",
  "nasal cavity",
  "thumb",
  "tongue",
  "spinal cord",
  "knee cap",
  "stomach",
];

const iterationToText = (i) => {
  const bodyCycles = Math.floor(i / bodyParts.length);
  const bodyPermutations = Math.floor(
    i / (bodyParts.length * (bodyParts.length - 1))
  );
  const verbPermutations = Math.floor(bodyPermutations / verbs.length);
  const body1 = i % bodyParts.length;
  const body2 =
    (i + 1 + (bodyCycles % (bodyParts.length - 1))) % bodyParts.length;
  const verb = (i + bodyPermutations) % verbs.length;
  const substance =
    (i + bodyPermutations + verbPermutations) % substances.length;
  return `${substances[substance]} ${verbs[verb]} from the ${bodyParts[body1]} to the ${bodyParts[body2]}.`;
};

const lenNLongest = (s, n) => s.sort((a, b) => b.length - a.length)[n].length;
const longestString =
  `   from the  to the  .`.length +
  lenNLongest(substances, 0) +
  lenNLongest(verbs, 0) +
  lenNLongest(bodyParts, 0) +
  lenNLongest(bodyParts, 1);

// ----------------------------------------------------
//    GAME OF LIFE
// ----------------------------------------------------

const alive = (cell, neighbors) => {
  if (!cell) return neighbors === 3;
  if (neighbors > 1 && neighbors < 4) return 1;
  return 0;
};

const lifeCountNeighbors = (cells) => {
  const numCells = cells.length;
  const neighbors = new Uint8Array(numCells);
  for (let i = 0; i < numCells; i++) {
    neighbors[i] =
      cells[(i - graphicsDim - 1 + numCells) % numCells] +
      cells[(i - graphicsDim + numCells) % numCells] +
      cells[(i - graphicsDim + 1 + numCells) % numCells] +
      cells[(i - 1 + numCells) % numCells] +
      cells[(i + 1) % numCells] +
      cells[(i + graphicsDim - 1) % numCells] +
      cells[(i + graphicsDim) % numCells] +
      cells[(i + graphicsDim + 1) % numCells];
  }
  return neighbors;
};

const lifeGeneration = (cells, neighbors) => {
  const nextNeighbors = neighbors.slice();
  const numCells = cells.length;
  const nextCells = cells.slice();
  for (let i = 0; i < numCells; i++) {
    const nextAlive = alive(cells[i], neighbors[i]);
    const neighborChange = nextAlive - cells[i];
    if (neighborChange !== 0) {
      nextNeighbors[
        (i - graphicsDim - 1 + numCells) % numCells
      ] += neighborChange;
      nextNeighbors[(i - graphicsDim + numCells) % numCells] += neighborChange;
      nextNeighbors[
        (i - graphicsDim + 1 + numCells) % numCells
      ] += neighborChange;
      nextNeighbors[(i - 1 + numCells) % numCells] += neighborChange;
      nextNeighbors[(i + 1) % numCells] += neighborChange;
      nextNeighbors[(i + graphicsDim - 1) % numCells] += neighborChange;
      nextNeighbors[(i + graphicsDim) % numCells] += neighborChange;
      nextNeighbors[(i + graphicsDim + 1) % numCells] += neighborChange;
    }
    nextCells[i] = nextAlive;
  }
  return [nextCells, nextNeighbors];
};

// ----------------------------------------------------
//    GRAPHICS SETUP
// ----------------------------------------------------
const graphicsDim = 128;
const numCells = Math.pow(graphicsDim, 2);
let resizeCells = new Uint8Array(numCells);
const stringToBitmap = (s) => s.split("").map((c) => font[c.charCodeAt(0)]);

const graphicsCanvas = document.createElement("canvas");
const graphicsContext = graphicsCanvas.getContext("2d");
graphicsCanvas.width = graphicsDim;
graphicsCanvas.height = graphicsDim;
const renderCanvas = document.body.appendChild(
  document.createElement("canvas")
);
renderCanvas.style.cursor = "pointer";
const renderContext = renderCanvas.getContext("2d");

const image = graphicsContext.getImageData(
  0,
  0,
  graphicsCanvas.width,
  graphicsCanvas.height
);

const displayImage = (cells) => {
  const numCells = cells.length;
  for (let c = 0; c < numCells; c++) {
    image.data.fill(cells[c] * 255, c * 4, c * 4 + 3);
  }
  graphicsContext.putImageData(image, 0, 0);
  const smallerDim = Math.min(window.innerWidth, window.innerHeight);
  const scale = smallerDim / graphicsDim;
  const xMargin = (window.innerWidth - smallerDim) / 2;
  const yMargin = (window.innerHeight - smallerDim) / 2;
  renderContext.save();
  renderContext.translate(xMargin, yMargin);
  renderContext.scale(scale, scale);
  renderContext.drawImage(graphicsCanvas, 0, 0);
  renderContext.restore();
};

const fitCanvasToWindow = () => {
  renderContext.canvas.width = window.innerWidth;
  renderContext.canvas.height = window.innerHeight;
  //  Image smoothing automatically re-enabled every time canvas is resized (annoyingly)
  renderContext.imageSmoothingEnabled = false;
  displayImage(resizeCells);
};
window.addEventListener("resize", fitCanvasToWindow);
fitCanvasToWindow();

// ----------------------------------------------------
//    ANIMATION
// ----------------------------------------------------

const fps = 30;
const msPerFrame = 1000 / fps;
const framesPerChar = 7;
const lifeIterationsPerCycle = 600;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const charsPerLine = Math.floor(image.width / 8);
for (let i = 0; i < image.data.length; i += 4) {
  image.data[i + 3] = 255;
}

const renderChar = (cells, text) => {
  const nextCells = cells.slice();
  const bitmap = stringToBitmap(text).slice(-1)[0];
  const charCount = text.length - 1;
  const left = (charCount % charsPerLine) * 8;
  const top = Math.floor(charCount / charsPerLine) * 8;
  for (let r = 0; r < 8; r++) {
    const y = top + r;
    for (let b = 0; b < 8; b++) {
      const x = left + b;
      nextCells[y * graphicsDim + x] |= bitmap[r][b];
    }
  }
  return nextCells;
};

const drawFrame = ({
  cells,
  frame,
  textIteration,
  textChar,
  textPauseFrames,
  lifeIteration,
  lifeNeighbors,
}) => {
  const fullText = iterationToText(textIteration);
  if (textChar < fullText.length) {
    if (textChar > 0) {
      if (textChar === 1 && textPauseFrames === 0)
        fetch("https://foss-binary-server.glitch.me", {
          method: "POST",
          body: JSON.stringify({
            cells: decoder.decode(cells),
            frame,
            textIteration,
            textChar,
            textPauseFrames,
            lifeIteration,
            lifeNeighbors: decoder.decode(lifeNeighbors),
          }),
        });
      cells = renderChar(cells, fullText.substring(0, textChar));
    }
    if (++textPauseFrames == framesPerChar) {
      textChar++;
      textPauseFrames = 0;
    }
  } else if (lifeIteration < lifeIterationsPerCycle) {
    if (lifeIteration++ == 0) lifeNeighbors = lifeCountNeighbors(cells);
    const cellsCopy = cells.slice();
    [cells, lifeNeighbors] = lifeGeneration(cells, lifeNeighbors);
  } else {
    textIteration++;
    textChar = 0;
    lifeIteration = 0;
  }
  frame++;
  return {
    cells,
    frame,
    textIteration,
    textChar,
    textPauseFrames,
    lifeIteration,
    lifeNeighbors,
  };
};

const animate = (frameState, currentTimestep, lastTimestep) => {
  const frames = (currentTimestep - lastTimestep) / msPerFrame;
  if (frames < 1) {
    return requestAnimationFrame((nextTimestep) =>
      animate(frameState, nextTimestep, lastTimestep)
    );
  }
  for (let f = 0; f < frames; f++) {
    frameState = drawFrame(frameState);
  }
  displayImage(frameState.cells);
  resizeCells = frameState.cells;
  requestAnimationFrame((nextTimestep) =>
    animate(frameState, nextTimestep, currentTimestep)
  );
};

const start = async () => {
  let introAnimationRequest;
  const response = await fetch("https://foss-binary-server.glitch.me", {});
  const {
    cells: cellDecoded,
    frame,
    textIteration,
    textChar,
    textPauseFrames,
    lifeIteration,
    lifeNeighbors: neighborDecoded,
  } = await response.json();
  const [cells, lifeNeighbors] =
    cellDecoded && neighborDecoded
      ? [encoder.encode(cellDecoded), encoder.encode(neighborDecoded)]
      : [new Uint8Array(numCells), new Uint8Array(numCells)];
  const frameState = {
    cells,
    frame,
    textIteration,
    textChar,
    textPauseFrames,
    lifeIteration,
    lifeNeighbors,
  };
  const startAnimation = () => {
    renderCanvas.style.cursor = "default";
    if (introAnimationRequest) cancelAnimationFrame(introAnimationRequest);
    requestAnimationFrame((timestep) =>
      animate(frameState, timestep, timestep)
    );
  };
  renderCanvas.addEventListener("click", startAnimation);
  const hours = Math.floor(frame / (fps * 3600))
    .toString()
    .padStart(2, "0");
  const minutes = (Math.floor(frame / (fps * 60)) % 60)
    .toString()
    .padStart(2, "0");
  const seconds = (Math.floor(frame / fps) % 60).toString().padStart(2, "0");
  const frames = (frame % fps).toString().padStart(2, "0");
  const introText = `Binary                          by Caleb Foss                   2021                            ${hours}:${minutes}:${seconds}:${frames}`;
  const displayIntroFrame = (cells, i) => {
    const renderedCells = renderChar(cells, introText.substring(0, i));
    displayImage(renderedCells);
    resizeCells = renderedCells;
    if (++i <= introText.length)
      introAnimationRequest = requestAnimationFrame((_) =>
        displayIntroFrame(renderedCells, i)
      );
  };
  displayIntroFrame(new Uint8Array(numCells), 1);
};
start();

let flashlight;
let animals = [];
let currentAnimalIndex;
let drag = false;
let gameHasLoaded = false;
let heightOrigin;
let widthOrigin;
let scaleX;
let scaleY;
let containerPosTopLeft;
let creatorMode = false;

window.onload = function () {
  window.addEventListener("resize", onWindowResize);

  // Do all one time operations here!
  if (!gameHasLoaded) {
    fetchAnimals();
    flashlight = document.getElementById("flashlight__overlay");
    gameHasLoaded = true;
  }

  // Register input listeners
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  flashlight.style.setProperty("--cursorX", $(flashlight).width() / 2 + "px");
  flashlight.style.setProperty("--cursorY", $(flashlight).height() / 2 + "px");

  containerPosTopLeft = $(flashlight).parent().position();
  getOriginalImgSize("./assets/imgs/Wimmelbild.jpg");
};

/**
 * Game state functions
 */
function onStartGameBtnPressed() {
  // Start from the first animal
  currentAnimalIndex = 0;

  $("#statustext").show();
  $("#button__overlay").hide();

  // TODO: animate flashlight

  // Update our status text in the UI
  updateStatusText("Welcome explorer!");
  // Start the first round with index 0
  startRound(currentAnimalIndex);
}

function startRound(round) {
  setTimeout(() => {
    updateStatusText("Can you spot the " + animals[round].name + "?");
  }, 3000);
}

function checkRound(coords) {
  // Check if flashlight is within range of at least one collider point
  const colliderPoints = animals[currentAnimalIndex].colliders;

  for (let i = 0; i < colliderPoints.length; i++) {
    const point = colliderPoints[i];

    if (checkDistanceToCollider(coords.x, coords.y, point)) {
      updateStatusText("You are doing great!");
      // TODO: Highlight entire animal

      // No distance check is needed any more
      return true;
    }
  }

  updateStatusText("Almost let's try it again!");

  return false;
}

function endGame() {
  setTimeout(() => {
    updateStatusText("Great you found all animals!");

    setTimeout(() => {
      $("#statustext").hide();
      $("#button__overlay").show();
      document.getElementById("gamebutton").textContent = "Restart Game!";
    }, 2000);
  }, 2000);
}

/**
 * Helper functions
 */

function fetchAnimals() {
  fetch("animals.json")
    .then((response) => response.json())
    .then((data) => (animals = data));
}

function updateStatusText(text) {
  document.getElementById("statustext").textContent = text;
}

function checkDistanceToCollider(x, y, collisionPoint) {
  // Flashlight coordinates must be scaled for correct comaprison at 100% img size
  let a = x - collisionPoint.x;
  let b = y - collisionPoint.y;
  // Calculatep distance with pythagorean theorem
  let distance = Math.sqrt(a * a + b * b);
  // For debugging only
  console.log(
    "Col X: " +
      collisionPoint.x +
      " / Col Y: " +
      collisionPoint.y +
      " / Distance: " +
      distance +
      " / Margin " +
      collisionPoint.margin / scaleX
  );
  return distance <= collisionPoint.margin / scaleX;
}

function highlightArea(collisionPoint) {
  // TODO
}

function getOriginalImgSize(imgSrc) {
  let newImg = new Image();

  newImg.onload = function () {
    heightOrigin = newImg.height;
    widthOrigin = newImg.width;
    console.log("Original img size x: " + widthOrigin + " /y: " + heightOrigin);

    // First time scale calculation
    calcScaleFactor(
      $(flashlight).width(),
      $(flashlight).height(),
      widthOrigin,
      heightOrigin
    );
  };

  newImg.src = imgSrc; // this must be done AFTER setting onload
}

function calcScaleFactor(x, y, xOrigin, yOrigin) {
  // Calculate new xy scale factor for collider points
  scaleX = x / xOrigin;
  scaleY = y / yOrigin;
  // For debugging only!
  console.log("Scale factor X: " + scaleX + " / Y: " + scaleY);
}

function onWindowResize() {
  calcScaleFactor(
    $(flashlight).width(),
    $(flashlight).height(),
    widthOrigin,
    heightOrigin
  );
}

/**
 * Input functions
 */
function onMouseDown() {
  flashlight.style.setProperty("--cursorVisibility", "none");
  drag = true;
}

function onMouseMove(e) {
  if (drag) {
    let x = e.clientX;
    let y = e.clientY;

    // Only working when y modification is also active!
    // As relative offset is needed we need to get the parents top/left coordinates
    flashlight.style.setProperty(
      "--cursorX",
      x - containerPosTopLeft.left + "px"
    );

    flashlight.style.setProperty(
      "--cursorY",
      y - containerPosTopLeft.top + "px"
    );
  }
}

/**
 * Always use this function to get relative coordinates from the viewport container!
 * We need the relative position inside the image container multiplied by the scale factor
 * in order to get the correct img coordinates at 100% img size.
 * @param {*} x the current mouse x value
 * @param {*} y the current mouse y value
 */
function getViewportCoords(x, y) {
  let coords = {
    x: (x - containerPosTopLeft.left) / scaleX,
    y: (y - containerPosTopLeft.top) / scaleY,
  };

  // For easy collider point creation and debugging
  console.log("Inside viewport x: " + coords.x + " / y: " + coords.y);

  return coords;
}

function onMouseUp(e) {
  flashlight.style.setProperty("--cursorVisibility", "grab");
  drag = false;

  let coords = getViewportCoords(e.clientX, e.clientY);

  if (checkRound(coords)) {
    currentAnimalIndex++;
  }

  if (currentAnimalIndex < animals.length) {
    startRound(currentAnimalIndex);
  } else {
    endGame();
  }
}

let flashlight;
let animals = [];
let currentAnimalIndex;
let drag = false;
let heightOrigin;
let widthOrigin;
let scaleX;
let scaleY;
let containerPosTopLeft;
let creatorMode = false;

window.onload = function () {
  // Do all one time operations here!p
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  fetchAnimals();
  flashlight = document.getElementById("flashlight__overlay");
  containerPosTopLeft = $(flashlight).parent().position();

  getOriginalImgSize("./assets/imgs/Wimmelbild.jpg");
};

/**
 * Game state functions
 */
function startGame() {
  // Reset flashlight position
  flashlight.style.setProperty("--cursorX", $(flashlight).width() / 2 + "px");
  flashlight.style.setProperty("--cursorY", $(flashlight).height() / 2 + "px");
  // TODO: initial flashlight animation

  // Update UI state
  $("#statustext").show();
  $("#button__overlay").hide();
  updateStatusText("Welcome explorer!");

  // Reset index for receiving attributes from the first animal later
  currentAnimalIndex = 0;
  // Start the first round with index 0
  startRound(currentAnimalIndex);
}

function startRound(round) {
  setTimeout(() => {
    updateStatusText("Can you spot the " + animals[round].name + "?");
  }, 3000);
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

/**
 * Always use this function to get the relative image coordinates at 100% img size!
 */
function getImgCoords(x, y) {
  // Calculate the relative position inside the image container multiplied by the scale factor
  // in order to get the correct img coordinates at 100% img size.
  let coords = {
    x: (x - containerPosTopLeft.left) / scaleX,
    y: (y - containerPosTopLeft.top) / scaleY,
  };

  // For easy collider point creation and debugging
  console.log("Inside viewport x: " + coords.x + " / y: " + coords.y);

  return coords;
}

/**
 * Checks if flashlight is within range of at least one collider point
 */
function checkForCollision(lightCoordsScaled) {
  const colliderPoints = animals[currentAnimalIndex].colliders;

  for (let i = 0; i < colliderPoints.length; i++) {
    const point = colliderPoints[i];

    // Immediately return as no additional distance checks are needed
    if (checkDistanceToColliderPoint(lightCoordsScaled, point)) {
      return true;
    }
  }

  // No collision was detected
  return false;
}

/**
 *  Helper function that checks if distance to collider point is within margin.
 *  Note that all calculations are happening in the original img space with 100% img size!
 */
function checkDistanceToColliderPoint(lightCoordsScaled, collisionPoint) {
  // Calculate distance with pythagorean theorem
  let a = lightCoordsScaled.x - collisionPoint.x;
  let b = lightCoordsScaled.y - collisionPoint.y;
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
      collisionPoint.margin
  );

  return distance <= collisionPoint.margin;
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

function onMouseUp(e) {
  // Block cursor pos updates
  drag = false;

  // Update cursor view
  flashlight.style.setProperty("--cursorVisibility", "grab");

  // Get cursor pos on original img
  let coords = getImgCoords(e.clientX, e.clientY);

  // Check for collisions
  const isColliding = checkForCollision(coords);

  if (isColliding) {
    // TODO: Highlight entire animal

    updateStatusText("You are doing great!");
    currentAnimalIndex++;
  } else {
    updateStatusText("Almost let's try it again!");
  }

  // Progress to next round or end game based on current animal index
  if (currentAnimalIndex < animals.length) {
    startRound(currentAnimalIndex);
  } else {
    endGame();
  }
}

function onStartGameBtnPressed() {
  startGame();
}

function onWindowResize() {
  calcScaleFactor(
    $(flashlight).width(),
    $(flashlight).height(),
    widthOrigin,
    heightOrigin
  );
}

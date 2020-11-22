let drag = false;
let animals = [];
let currentAnimalIndex;
let gameHasLoaded = false;

/**
 * Game state functions
 */

function startGame() {
  if (!gameHasLoaded) {
    fetchAnimals();

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    gameHasLoaded = true;
  }

  currentAnimalIndex = 0;
  setFlashlight(true);

  document.getElementById("gamebutton").style.display = "none";
  document.getElementById("statustext").style.display = "block";

  updateStatusText("Welcome explorer!");

  startRound(0);
}

function startRound(round) {
  setTimeout(() => {
    updateStatusText("Can you spot the " + animals[round].name + "?");
  }, 3000);
}

function checkRound(flashLightX, flashlightY) {
  // For easy collider point creation and debugging
  console.log("x:" + flashLightX + " / y: " + flashlightY);

  // Check if flashlight is within range of one collider
  const colliders = animals[currentAnimalIndex].colliders;

  for (let i = 0; i < colliders.length; i++) {
    const col = colliders[i];

    if (checkDistanceToCollider(flashLightX, flashlightY, col)) {
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
      document.getElementById("statustext").style.display = "none";
      document.getElementById("gamebutton").style.display = "block";
      document.getElementById("gamebutton").textContent = "Restart Game!";
    }, 2000);
  }, 3000);
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

function checkDistanceToCollider(flashLightX, flashLightY, collisionPoint) {
  let a = flashLightX - collisionPoint.x;
  let b = flashLightY - collisionPoint.y;
  let distance = Math.sqrt(a * a + b * b);

  return distance <= collisionPoint.margin;
}

function highlightArea(collisionPoint) {
  // TODO
}

function setFlashlight(on) {
  // TODO
}

/**
 * Input functions
 */
function onMouseDown() {
  document.documentElement.style.setProperty("--cursorVisibility", "none");
  drag = true;
}

function onMouseMove(e) {
  if (drag) {
    let x = e.clientX;
    let y = e.clientY;

    // Only working when y modification is also active!
    document.documentElement.style.setProperty("--cursorX", x + "px");
    document.documentElement.style.setProperty("--cursorY", y + "px");
  }
}

function onMouseUp(e) {
  document.documentElement.style.setProperty("--cursorVisibility", "grab");
  drag = false;

  if (checkRound(e.clientX, e.clientY)) {
    currentAnimalIndex++;
  }

  if (currentAnimalIndex < animals.length) {
    startRound(currentAnimalIndex);
  } else {
    endGame();
  }
}

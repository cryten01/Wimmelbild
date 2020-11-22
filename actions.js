let drag = false;
let animals = [];
let currentAnimalIndex = 0;

function startGame() {
  fetchAnimals();

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function fetchAnimals() {
  fetch("animals.json")
    .then((response) => response.json())
    .then((data) => (animals = data));
}

function checkIfAnimalWasFound(flashLightX, flashlightY) {
  // For easy collider point creation and debugging
  console.log("x:" + flashLightX + " / y: " + flashlightY);

  // Check if flashlight is within range of one collider
  const colliders = animals[currentAnimalIndex].colliders;

  for (let i = 0; i < colliders.length; i++) {
    const col = colliders[i];

    if (checkDistanceToCollider(flashLightX, flashlightY, col)) {
      // For debugging only
      console.log("Found animal");

      // TODO: Highlight entire animal

      // Return as no distance check is needed any more
      return;
    }
  }
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
  checkIfAnimalWasFound(e.clientX, e.clientY);

  document.documentElement.style.setProperty("--cursorVisibility", "grab");
  drag = false;

  // TODO: move to next animal if it was found
}

startGame();

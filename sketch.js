let car;
let roadLines = [];
let lineSpacing = 60;
let lineLength = 30;
let carSpeed = 5;
let minSpeed = 0;
let maxSpeed = 20;
let speedOffset = 0;

let fallingObjects = []; // from top (normal)
let risingObjects = []; // from bottom (reverse)
let lastSpawnTime = 0;
let gameOver = false;
let gameOverSoundPlayed = false;
let gameOverImg;
let gameStarted = false;
let reversing = false;
let isReversing = false;
let carHealth = 4;

//car damage code
let carDamageCooldown = 0; //cooldown timer (in frames)
let damageCooldownTime = 30; //how many frames of inviciblity

//obstacle spawn code
let spawnTimer = 5000;
let carDistance = 0;

let sidewalkOffset = 0;
let imgSideLeft;
let imgSideRight;
let potImages = [];
let carImage, carImageDamaged, carImageHeavyDamage, carImageCritical;
let carDamaged = false;
let music;
let titleScreenImage;
let gameState = "title";

function preload() {
  titleScreenImage = loadImage("game_screens1.png");
   gameOverImg = loadImage("game_over1.png");
  
  imgSideLeft = loadImage("sidewalks.png");
  imgSideRight = loadImage("sidewalk2.png");

  imgPot = loadImage("pothole1.png");
  imgPots = loadImage("pothole2.png");
  imgPoth = loadImage("pothole3.png");

  hitSound = loadSound("brake-crash.wav");
  overSound = loadSound("car-crash.wav");
  Music = loadSound("Mindwinder-b-Financier-Loud-Soun.mp3");

  // Main car image assignments
  carImage = loadImage("lambo.png");                  // 4 HP
carImageModerateDamage = loadImage("lambo2.png");   // 3 HP
carImageDamaged = loadImage("lambo3.png");          // 2 HP
carImageHeavyDamage = loadImage("lambo4.png");      // 1 HP
carImageCritical = loadImage("lambo4.png");         // 0 HP (same as heavy, or different)


  // Load pothole images
  for (let i = 1; i <= 3; i++) {
    let potholeImg = loadImage(`pothole${i}.png`);
    potImages.push(potholeImg);
  }
}
  
function setup() {
   let canvas = createCanvas(620, 700);
  canvas.id('gameCanvas');
  resetGame();
}

function draw() {
  background(100);

  if (gameState === "title") {
    image(titleScreenImage, 0, 0, width, height);
  
    return; // Only return inside the draw() function
  } else if (gameState === "play") {
    background(100);

    if (keyIsDown(32)) {
      isReversing = true;
    } else {
      isReversing = false;
    }

    reversing = isReversing;

    if (gameOver) {
  if (!gameOverSoundPlayed && overSound && overSound.isLoaded()) {
    overSound.play();
    gameOverSoundPlayed = true;
  }

  push();
    imageMode(CENTER);
    image(gameOverImg, width / 2, height / 2, 600, 700); // Adjust size if needed
  pop();
      
    textSize(28);
  fill(255,0,0);
  text("Distance Reached: " + int(carDistance) + " m", width / 2, 320);
      
  return;
}

    updateSpeed();
    drawRoad();
    drawCar();
    handleInput();

    spawnObjects();
    updateObjects();
    checkCollisions();
    gameOverTrigger();
    speedometer();
  }
}

///Game restart button and reverse /////
function keyPressed() {
  if (gameState === "title" && key === ' ') {
    gameState = "play";
 
    if (Music && !Music.isPlaying()) {
      Music.setLoop(true);
      Music.setVolume(0.3);
      Music.play();
    }
  }

  if (gameOver && key === ' ') {
    resetGame();
    gameOver = false;
    carHealth = 4;
    carDistance = 0;
    gameState = "play";
    
    if (Music && !Music.isPlaying()) {
      Music.setLoop(true);
      Music.setVolume(0.3);
      Music.play();
    }
  }
}

function resetGame() {
  car = createVector(width / 2, height - 80);
  carSpeed = 5;
  speedOffset = 0;
  roadLines = [];
  for (let y = 0; y < height; y += lineSpacing) {
    roadLines.push({ x: width / 2, y: y });
  }
  fallingObjects = [];
  risingObjects = [];
  lastSpawnTime = millis();
  gameOver = false;
  gameOverSoundPlayed = false;
  reversing = false;
  carHealth = 4;
  carDistance = 0;
  sidewalkOffset = 0;
   gameStarted = false;
  
}

function updateSpeed() {
  if (keyIsDown(UP_ARROW)) {
    carSpeed += 0.1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    carSpeed -= 0.1;
  }
  carSpeed = constrain(carSpeed, minSpeed, maxSpeed);
}
/////////////// CAR IS MADE HERE  UNDER COMMENT///////////////
function drawCar() {
  let imgToDraw;

  if (carHealth <= 0) {
    imgToDraw = carImageCritical;         // 0 HP
  } else if (carHealth === 1) {
    imgToDraw = carImageHeavyDamage;      // 1 HP
  } else if (carHealth === 2) {
    imgToDraw = carImageDamaged;          // 2 HP
  } else if (carHealth === 3) {
    imgToDraw = carImageModerateDamage;   // 3 HP — need to assign this
  } else {
    imgToDraw = carImage;                 // 4 HP — perfect condition
  }

  push();
  imageMode(CENTER);

  speedOffset = map(carSpeed, minSpeed, maxSpeed, 0, 50);
  let carY = reversing ? 80 + speedOffset : height - 80 - speedOffset;

  translate(car.x, carY);

  if (!reversing) {
    scale(-1, 1);
  }

  image(imgToDraw, 0, 0, 60, 100);
  pop();
}

///// This is where the white line is /////
function drawRoad() {
  if (gameOver) return;
  // Update sidewalk offset based on direction and speed
  sidewalkOffset += reversing ? -carSpeed : carSpeed;
 if (imgSideLeft) {
  sidewalkOffset %= imgSideLeft.height;
} // wrap to prevent huge values

  // Draw sidewalks (left and right)
  let sidewalkYStart = -imgSideLeft.height * 2;  // Start 2 tiles above
let sidewalkYEnd = height + imgSideLeft.height * 2; // End 2 tiles below

for (let y = sidewalkYStart; y < sidewalkYEnd; y += imgSideLeft.height) {
  image(imgSideLeft, 0, y + sidewalkOffset, 100, imgSideLeft.height);
  image(imgSideRight, width - 100, y + sidewalkOffset, 100, imgSideRight.height);
}
  // Draw road lines on top
  stroke(255);
  strokeWeight(4);

  for (let i = 0; i < roadLines.length; i++) {
    let lineSeg = roadLines[i];
    lineSeg.y += reversing ? -carSpeed : carSpeed;

    if (lineSeg.y > height) {
      lineSeg.y = 0;
    }
    if (lineSeg.y < 0) {
      lineSeg.y = height;
    }

    line(lineSeg.x, lineSeg.y, lineSeg.x, lineSeg.y + lineLength);
  }
}

function handleInput() {
  if (speedOffset > 0) {
    if (keyIsDown(LEFT_ARROW)) {
      car.x -= 5;
    }
  }
  if (keyIsDown(RIGHT_ARROW)) {
    car.x += 5;
  }
  if (car.x > width - 100) {
    car.x = width - 100;
  }
  if (car.x < 100) {
    car.x = 100; // Stops car from going off the left side
  }
}
/////SPAWNS THE OBJECT /////////
function spawnObjects() {
  //this IF statement looks at the carDistance and updates the spawnTimer. The faster you drive the more chaos is added. Tweak the distance and spawnTimer numbers where needed
  if (carDistance < 500) {
    spawnTimer = 5000;
  } else if (carDistance < 1000) {
    spawnTimer = 2500;
  } else if (carDistance < 2000) {
    spawnTimer = 1000;
  } else if (carDistance < 3000) {
    spawnTimer = 500;
  } else {
    spawnTimer = 250; // Example: increase frequency beyond 3000 units
  }

 if (millis() - lastSpawnTime > spawnTimer) {
  let objX = random(50, width - 50);
  let randomImage = random(potImages);

  let obj = {
    pos: createVector(objX, reversing ? height : 0),
    img: randomImage
  };

  if (reversing) {
    risingObjects.push(obj);
  } else {
    fallingObjects.push(obj);
  }

  lastSpawnTime = millis();
}
}


///// does object movement in reverse //////
function updateObjects() {
  if (!reversing) {
    for (let obj of fallingObjects) {
      obj.pos.y += 2 + map(carSpeed, minSpeed, maxSpeed, 2, 10);
      image(obj.img, obj.pos.x - 20, obj.pos.y - 20, 60, 60);
    }
  } else {
    for (let obj of risingObjects) {
      obj.pos.y -= 2 + map(carSpeed, minSpeed, maxSpeed, 2, 10);
      image(obj.img, obj.pos.x - 20, obj.pos.y - 20, 60, 60);
    }
  }
}

function checkCollisions() {
  let carY = reversing ? 80 + speedOffset : height - 80 - speedOffset;
  let activeObjects = reversing ? risingObjects : fallingObjects;

  if (carDamageCooldown > 0) {
    carDamageCooldown--;
    return;
  }

  for (let obj of activeObjects) {
    let dx = abs(obj.pos.x - car.x);
    let dy = abs(obj.pos.y - carY);
    if (dx < 35 && dy < 45) {
      carHealth -= 1;
      carDamaged = true;
      carDamageCooldown = damageCooldownTime;

      if (hitSound && !hitSound.isPlaying()) {
        hitSound.play();
      }
      break;
    }
  }
}


function gameOverTrigger() {
  if (carHealth <= 0) {
    gameOver = true;

    // Stop music when game ends
    if (Music && Music.isPlaying()) {
      Music.stop();
    }
  }
}


//UI to add MPH that takes a general idea of "speed"
//change this to art or better graphics when needed
function speedometer() {
  carDistance += (reversing ? -1 : 1) * 0.1 * carSpeed;
  carDistance = max(0, carDistance); // prevent it from going negative
  noStroke();
  fill(0, 255, 0);
  textSize(20);
  textAlign(RIGHT);
  text(int(carSpeed * 3) + " mph", width - 20, height - 20);
  textAlign(LEFT);
  text("Distance " + int(carDistance), 0 + 20, height - 20);

  textAlign(CENTER);
  text("Car Health : " + carHealth, width / 2, height - 20);
}

import * as THREE from "https://threejs.org/build/three.module.js";
import { FBXLoader } from "https://threejs.org/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://threejs.org/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://threejs.org/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "https://threejs.org/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "https://threejs.org/examples/jsm/shaders/FXAAShader.js";
import { OutputPass } from "https://threejs.org/examples/jsm/postprocessing/OutputPass.js";
import { FontLoader } from "https://threejs.org/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://threejs.org/examples/jsm/geometries/TextGeometry.js";
import { MeshBasicMaterial } from "three";
import { FirstPersonControls } from "https://threejs.org/examples/jsm/controls/FirstPersonControls.js";


import { createBoard, addCoin } from "./board.js";

const inGameScene1NPC = new THREE.Scene();
inGameScene1NPC.background = new THREE.Color(0xf2e8c9);

const inGameScene2NPC = inGameScene1NPC;

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2e8c9);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
scene.add(new THREE.AxesHelper(5));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let board;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.domElement.id = "myCanvas";
document.body.appendChild(renderer.domElement);

camera.position.z = 20;
camera.position.y = 10;
camera.position.x = 15;

//Lights ///////////////////////////////////////

const light = new THREE.PointLight(0xffffff, 200);
light.position.set(0, 40, -30);
scene.add(light);

const light1 = new THREE.PointLight(0xffffff, 200);
light1.position.set(30, 40, -30);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 200);
light2.position.set(-30, 40, -30);
scene.add(light2);

const light3 = new THREE.PointLight(0xffffff, 200);
light3.position.set(-30, 40, -30);
scene.add(light3);

const light5 = new THREE.PointLight(0xffffff, 200);
light5.position.set(-30, 40, 0);
scene.add(light5);

const light6 = new THREE.PointLight(0xffffff, 200);
light6.position.set(-30, 40, 20);
scene.add(light6);

const light7 = new THREE.PointLight(0xffffff, 200);
light7.position.set(35, 10, 30);
scene.add(light7);
inGameScene1NPC.add(light7.clone());

const lightOnGame = new THREE.DirectionalLight(0xfcf3da, 2);
lightOnGame.position.set(38, 30, 12);
scene.add(lightOnGame);
inGameScene1NPC.add(lightOnGame.clone());

const LightTheRoom = new THREE.DirectionalLight(0xfcf3da, 0.8);
LightTheRoom.position.set(30,25,37)
inGameScene1NPC.add(LightTheRoom)


// /////////////////////////////////////////

const fbxLoader = new FBXLoader();
let Global_mixer = new THREE.AnimationMixer();
let Global_mixer1 = new THREE.AnimationMixer();

fbxLoader.load(
  "static/models/house/AA.fbx",
  (object) => {
    object.scale.multiplyScalar(0.12);
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // child.material = material
      }
    });

    scene.add(object);
    inGameScene1NPC.add(object.clone());
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

fbxLoader.load(
  "static/models/connectFour/board.fbx",
  (object) => {
    object.scale.multiplyScalar(0.0007);
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(object);
    object.position.y = -4;
    object.position.x = 21;
    object.position.z = 46;
    board = object;
    inGameScene1NPC.add(object.clone());
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);
let arrow;

fbxLoader.load(
  "static/models/arrow/arrow1.fbx",
  (object) => {
    object.scale.multiplyScalar(0.0003);
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(object);
    object.position.y = 2;
    object.position.x = 21;
    object.position.z = 42;
    arrow = object;
    animate();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
orbitControls.dampingFactor = 0.25;
orbitControls.screenSpacePanning = false;
orbitControls.maxPolarAngle = Math.PI / 2;



const amplitude = 5; // Adjust the amplitude based on the desired height of oscillation
const frequency = 1; // Adjust the frequency based on how quickly you want it to move

////////////////////////////////////
let composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

let outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

let effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms["resolution"].value.set(
  1 / window.innerWidth,
  1 / window.innerHeight
);
composer.addPass(effectFXAA);

window.addEventListener("resize", onWindowResize);

renderer.domElement.style.touchAction = "none";
renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("click", onClick);

let selectedObjects = [];

let change1NPC = false;
let change2NPC = false;

function onClick(event) {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(scene, true);

  if (
    intersects.length > 0 &&
    intersects[0].object.name == "4gewinnt" &&
    scene != inGameScene1NPC &&
    scene != inGameScene2NPC
  ) {
    let btn1 = document.getElementById("computerVSHumanButton");
    let btn2 = document.getElementById("computerVSComputerButton");
    let div = document.getElementById("gameMode");
    btn1.style.display = "block";
    btn2.style.display = "block";
    div.style.display = "block";
  }
}


let btn1 = document.getElementById("computerVSHumanButton");
let btn2 = document.getElementById("computerVSComputerButton");
let btn3 = document.getElementById("start");
let btn4 = document.getElementById("back");
let div = document.getElementById("gameMode");
btn1.addEventListener("click", () => {
  reset_board();
  change1NPC = true;
  change2NPC = false;
  socket.removeAllListeners()
  btn1.style.display = "none";
  btn2.style.display = "none";
  div.style.display = "none";
  btn3.style.display = "block";
  // Add your button click logic here
});

btn3.addEventListener("click", (event) => {
  if (!socket.connected) {
    StartGame();
  }
  btn3.style.display = "none";
  btn4.style.display = 'block';
  console.log("KDSSDKFLSKDLF")
});

btn4.addEventListener("click", () => {
  btn4.style.display = "none"
  btn3.style.display = "none";
  change1NPC = false;
  change2NPC = false;
  socket.emit("please_disconnect")
  socket.close();
  console.log("clicked on back")
  let div = document.getElementById("turn_box");
  div.style.display = "none";
});

btn2.addEventListener("click", () => {
  reset_board();
  change2NPC = true;
  change1NPC = false;
  socket.removeAllListeners()
  btn2.style.display = "none";
  btn1.style.display = "none";
  div.style.display = "none";
  btn3.style.display = "block";

});


function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  checkIntersection();
}

function addSelectedObject(object) {
  selectedObjects = [];
  selectedObjects.push(object);
}

function checkIntersection() {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(scene, true);

  if (intersects.length > 0 && intersects[0].object.name == "4gewinnt") {
    const selectedObject = intersects[0].object;
    addSelectedObject(selectedObject);
    outlinePass.selectedObjects = selectedObjects;
  } else {
    outlinePass.selectedObjects = [];
  }
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);

  effectFXAA.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );
}

// IN GAME
let objects = [];

fbxLoader.load(
  "static/models/animations/Sitting.fbx",
  (object) => {
    console.log(object);

    object.scale.multiplyScalar(0.1);

    // Add the model to the scene
    inGameScene1NPC.add(object);
    objects.push(object);

    // Set the initial position of the NPC
    object.position.y = -10;
    object.position.x = 38;
    object.position.z = 40;
    object.rotation.y = THREE.MathUtils.degToRad(-90)

    // Try to access the animations directly from the object
    const mixer = new THREE.AnimationMixer( object );
    Global_mixer = mixer;
    console.log("mixer",mixer)
    const clips = object.animations;
    console.log("clips",clips)
    const clip = THREE.AnimationClip.findByName( clips, 'mixamo.com' );
    if (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    } else {
      console.error("Animation clip not found");
    }
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% model loaded");
  },
  (error) => {
    console.log(error);
  }
);




fbxLoader.load(
  "static/models/animations/MaleSittingPose.fbx",
  (object) => {
    console.log(object);

    object.scale.multiplyScalar(0.1);

    // Add the model to the scene
    inGameScene1NPC.add(object);
    objects.push(object);

    // Set the initial position of the NPC
    object.position.y = -10;
    object.position.x = 2;
    object.position.z = 40;
    object.rotation.y = THREE.MathUtils.degToRad(90)

    // Try to access the animations directly from the object
    const mixer = new THREE.AnimationMixer( object );
    Global_mixer1 = mixer;
    console.log("mixer",mixer)
    const clips = object.animations;
    console.log("clips",clips)
    const clip = THREE.AnimationClip.findByName( clips, 'mixamo.com' );
    if (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    } else {
      console.error("Animation clip not found");
    }
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% model loaded");
  },
  (error) => {
    console.log(error);
  }
);



const url = "http://127.0.0.1:5000";
const socket = io(url, {
  autoConnect: false,
  reconnection: false
});



function StartGame() {
  console.log("adaadwdaddada")
  const grid1 = createBoard();
  const grid2 = createBoard();
  inGameScene1NPC.add(grid1);
  inGameScene2NPC.add(grid2);

  reset_board()
  reset_board()
  reset_board()
  reset_board()
  socket.connect()
  
  socket.emit("computer_turn");
  let div = document.getElementById("turn_box");
  let text = document.getElementById("turn");
  text.innerText = "Red's Turn ";
  div.style.display = "block";

  socket.on("connect", function () {
    console.log("connected");
  });

  socket.on("disconnect", function () {
    console.log("Server disconnected");
  });

  socket.on("update_board_HvsC", (row, col) => {
    console.log("updated", row, col); // "got it"

    if (change1NPC == true && change2NPC == false){
      addCoin(inGameScene1NPC, grid1, row + 1, col + 1, 1);
      socket.emit("human_request")
    }

    if (change1NPC == false && change2NPC == true){
      addCoin(inGameScene2NPC, grid2, row + 1, col + 1, 1);
      socket.emit('monte_carlo')
      let div = document.getElementById("turn_box");
      let text = document.getElementById("turn");
      text.innerText = "Yellow's Turn ";
      div.style.display = "block";
    }
  });

  socket.on("update_board_CvsC", (row, col) => {
    console.log("updated", row, col); // "got it"
    addCoin(inGameScene2NPC, grid1, row + 1, col + 1, 2);
    let div = document.getElementById("turn_box");
    let text = document.getElementById("turn");
    text.innerText = "Red's Turn ";
    div.style.display = "block";
  });


  socket.on("human_input_request", ()=>{
    console.log("requesting human input");
    let div = document.getElementById("turn_box");
    let text = document.getElementById("turn");
    text.innerText = "Your Turn ";
    div.style.display = "block";
    getColumn()
      .then((h_col) => {
        console.log("Clicked on number:", h_col);
        socket.emit("human_input", h_col);
      })
      .catch((error) => {
        console.error("Error", error);
      });

  })
  socket.on("row", (row, col) => {
    console.log("hi", row, col);
    addCoin(inGameScene1NPC, grid1, row + 1, col + 1, 2);
    let div = document.getElementById("turn_box");
    let text = document.getElementById("turn");
    text.innerText = "Red's Turn ";
    div.style.display = "block";
    
  });



  socket.on("game_over", (data) => {
    console.log("Game over. Winner:", data.winner);
    let div = document.getElementById("turn_box");
    let text = document.getElementById("turn");
    text.innerText = "Game Over, " + data.winner;
    div.style.display = "block";
    // Handle the game over event on the frontend (e.g., show winner, end game, etc.)
  });
}

function reset_board() {
  for (let i = 0; i <= inGameScene1NPC.children.length - 1; i++) {
    let item = inGameScene1NPC.children[i];
    if (item.type == "Mesh") {
      inGameScene1NPC.remove(item);
      item.geometry.dispose();
      item.material.dispose();
    }
  }

  for (let i = 0; i <= inGameScene2NPC.children.length - 1; i++) {
    let item = inGameScene2NPC.children[i];
    if (item.type == "Mesh") {
      inGameScene2NPC.remove(item);
      item.geometry.dispose();
      item.material.dispose();
    }
  }
}



function generate_indexes() {
  let len = 7;
  let indexes = new THREE.Group();

  // Load the font asynchronously
  var fontLoader = new FontLoader();
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    function (font) {
      for (let i = 1; i <= len; i++) {
        var textGeometry = new TextGeometry(i.toString(), {
          font: font,
          size: 0.7, // Adjust the size as needed
          height: 0.1,
        });

        var textMaterial = new MeshBasicMaterial({ color: 0x000000 });
        var textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position each index in a row
        textMesh.position.x = (i - (len + 1) / 2) * 1.7; // Adjust the position based on the number of indexes
        textMesh.position.y = textMesh.position.y + 5;
        textMesh.name = "Mesh_" + i;

        // Add the text mesh to the group
        indexes.add(textMesh);
      }

      indexes.scale.multiplyScalar(0.75);
      indexes.position.z = 42;
      indexes.position.x = indexes.position.x + 21;
      indexes.name = "IndexGroup";
      inGameScene1NPC.add(indexes);
    }
  );
}
generate_indexes();

function getColumn() {
  return new Promise((resolve, reject) => {
    for (let i = 0; i <= inGameScene1NPC.children.length - 1; i++) {
      let item = inGameScene1NPC.children[i];
      if (item.name == "IndexGroup") {
        let indexes = item;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("click", onMouseClick);
        let highlightedMesh = null;
        function onMouseMove(event) {
          // Calculate normalized device coordinates (NDC)
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          // Update the raycaster
          raycaster.setFromCamera(mouse, camera);

          // Check for intersections with the text meshes
          var intersects = raycaster.intersectObjects(indexes.children, true);

          // If there are intersections, highlight the first one
          if (intersects.length > 0) {
            var intersectedMesh = intersects[0].object;

            // If the intersected mesh is different from the highlighted one, update the highlight
            if (intersectedMesh !== highlightedMesh) {
              // Reset the previous highlighted mesh (if any)
              if (highlightedMesh) {
                // Reset the material or remove the highlight effect
                highlightedMesh.material.color.setHex(0x000000);
                highlightedMesh.scale.set(1, 1, 1);
              }

              // Update the highlighted mesh
              highlightedMesh = intersectedMesh;

              // Apply the highlight effect to the new mesh
              highlightedMesh.material.color.setHex(0x00ff00); // You can customize the highlight color
              document.body.style.cursor = "pointer";
            }
          } else {
            // If no intersections, reset the highlight
            if (highlightedMesh) {
              highlightedMesh.material.color.setHex(0x000000);
              highlightedMesh = null;
            }
            document.body.style.cursor = "auto";
          }
        }
        function onMouseClick(event) {
          // Calculate normalized device coordinates (NDC)
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          // Update the raycaster
          raycaster.setFromCamera(mouse, camera);

          // Check for intersections with the text meshes
          var intersects = raycaster.intersectObjects(indexes.children, true);

          // If there are intersections, retrieve the number associated with the clicked mesh
          if (intersects.length > 0) {
            var clickedMesh = intersects[0].object;
            var clickedNumber = parseInt(clickedMesh.name.split("_")[1], 10);

            // Log or use the clicked number as needed
            resolve(clickedNumber);
            cleanupEventListeners();
          }
        }
      }
      function cleanupEventListeners() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("click", onMouseClick);
      }
    }
  });
}

//We fetch the state of the board each time and add the coins using the addCoin function depending on who's the player who played where..etc



/////////////////
// Render loop
var clock = new THREE.Clock();
function animate() {
  if (change1NPC == true && change2NPC == false) {
      camera.position.z = 51;
      camera.position.y = -4;
      camera.position.x = 21;
    requestAnimationFrame(animate);
    orbitControls.update();
    Global_mixer.update(0.01);
    Global_mixer1.update(0.01);
    renderer.render(inGameScene1NPC, camera);

  } else if (change2NPC == true && change1NPC == false) {
      camera.position.z = 51;
      camera.position.y = -4;
      camera.position.x = 21;
    requestAnimationFrame(animate);
    orbitControls.update();
    Global_mixer.update(0.01);
    Global_mixer1.update(0.01);
    renderer.render(inGameScene2NPC, camera);
  } else {
    requestAnimationFrame(animate);
    if (arrow) {
      // Update arrow position based on sine function
      arrow.position.y =
        10 + amplitude * Math.sin(frequency * performance.now() * 0.003);
      }
    Global_mixer.update(0.01);
    Global_mixer1.update(0.01);
    orbitControls.update();
    renderer.render(scene, camera);
    composer.render();
  }
}

animate();

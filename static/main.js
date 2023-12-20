import * as THREE from 'https://threejs.org/build/three.module.js';
import { FBXLoader } from 'https://threejs.org/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://threejs.org/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'https://threejs.org/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from 'https://threejs.org/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'https://threejs.org/examples/jsm/postprocessing/OutputPass.js';

import {addCoin, createBoard} from './board.js'


const inGameScene = new THREE.Scene();
inGameScene.background = new THREE.Color(0xF2E8C9)


let scene = new THREE.Scene();
scene.background = new THREE.Color(0xF2E8C9)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(new THREE.AxesHelper(5))

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();



let board;


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

camera.position.z = 20;
camera.position.y = 10;
camera.position.x = 15;

//Lights ///////////////////////////////////////

const light = new THREE.PointLight(0xffffff, 200)
light.position.set(0, 40, -30)
scene.add(light)

const light1 = new THREE.PointLight(0xffffff, 200)
light1.position.set(30, 40, -30)
scene.add(light1)

const light2 = new THREE.PointLight(0xffffff, 200)
light2.position.set(-30, 40, -30)
scene.add(light2)

const light3 = new THREE.PointLight(0xffffff, 200)
light3.position.set(-30, 40, -30)
scene.add(light3)

const light5 = new THREE.PointLight(0xffffff, 200)
light5.position.set(-30, 40, 0)
scene.add(light5)

const light6 = new THREE.PointLight(0xffffff, 200)
light6.position.set(-30, 40, 20)
scene.add(light6)

const light7 = new THREE.PointLight(0xffffff, 200)
light7.position.set(35, 10, 30)
scene.add(light7)
inGameScene.add(light7.clone())


const lightOnGame = new THREE.DirectionalLight(0xFCF3DA, 2)
lightOnGame.position.set(38, 30, 10)
scene.add(lightOnGame)
inGameScene.add(lightOnGame.clone())



// /////////////////////////////////////////

const fbxLoader = new FBXLoader()





fbxLoader.load(
  'static/models/house/AA.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.12); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
          // child.material = material
      }
    } )

      scene.add(object)
      inGameScene.add(object.clone())
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)


fbxLoader.load(
  'static/models/connectFour/board.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.0007); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }
  
    } )
      scene.add(object)
      object.position.y = -4
      object.position.x = 21
      object.position.z = 43
      board = object
      inGameScene.add(object.clone())
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)
let arrow; 

fbxLoader.load(
  'static/models/arrow/arrow1.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.0003); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }
    } )
      scene.add(object)
      object.position.y = 2
      object.position.x = 21
      object.position.z = 42
      arrow = object;
      animate();
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
orbitControls.dampingFactor = 0.25;
orbitControls.screenSpacePanning = false;
orbitControls.maxPolarAngle = Math.PI / 2;

const amplitude = 5;  // Adjust the amplitude based on the desired height of oscillation
const frequency = 1;  // Adjust the frequency based on how quickly you want it to move

////////////////////////////////////
let composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
composer.addPass( outlinePass );

const outputPass = new OutputPass();
composer.addPass( outputPass );

let effectFXAA = new ShaderPass( FXAAShader );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
composer.addPass( effectFXAA );

window.addEventListener( 'resize', onWindowResize );

renderer.domElement.style.touchAction = 'none';
renderer.domElement.addEventListener( 'pointermove', onPointerMove );
renderer.domElement.addEventListener( 'click', onClick );

let selectedObjects = [];

let change = false;
function onClick(event){
  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObject( scene, true );

  if ( intersects.length > 0  && intersects[0].object.name == '4gewinnt') {
    change = true;
  }
}

function onPointerMove( event ) {

  if ( event.isPrimary === false ) return;

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  checkIntersection();
}

function addSelectedObject( object ) {

  selectedObjects = [];
  selectedObjects.push( object );

}

function checkIntersection() {

  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObject( scene, true );

  if ( intersects.length > 0  && intersects[0].object.name == '4gewinnt') {
    const selectedObject = intersects[ 0 ].object;
    addSelectedObject( selectedObject );
    outlinePass.selectedObjects = selectedObjects;

  }else {

    outlinePass.selectedObjects = [];

  }

}

function onWindowResize() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
  composer.setSize( width, height );

  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );

}



// IN GAME
let objects = []

fbxLoader.load(
  'static/models/connectFour/red_coin.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.0007); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }
    } )
      inGameScene.add(object)
      objects.push(object)
      object.position.y = -4
      object.position.x = 17
      object.position.z = 40
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)


fbxLoader.load(
  'static/models/connectFour/yellow_coin.fbx',
  (object) => {
    console.log(object)
    object.scale.multiplyScalar(0.0007); 
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
      }
    } )
      inGameScene.add(object)
      objects.push(object)
      object.position.y = -4
      object.position.x = 27
      object.position.z = 40
  },
  (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
      console.log(error)
  }
)



let grid = createBoard()
inGameScene.add(grid)
// grid.position.y = 0
// grid.position.x = 21

addCoin(inGameScene,grid, 6, 7, 1)
addCoin(inGameScene,grid, 5, 7, 2)
addCoin(inGameScene,grid, 6, 4, 2)


//We fetch the state of the board each time and add the coins using the addCoin function depending on who's the player who played where..etc 


/////////////////
// Render loop
function animate() {
  if (change == true){
    scene = inGameScene
    if (scene == inGameScene){
      camera.position.z = 51;
      camera.position.y = -4;
      camera.position.x = 21;
    }
    requestAnimationFrame(animate);
    orbitControls.update()
    renderer.render(scene, camera);
  }  
  else{
  requestAnimationFrame(animate);
  orbitControls.update();
  if (arrow) {
    // Update arrow position based on sine function
    arrow.position.y = 10 + amplitude * Math.sin(frequency * performance.now() * 0.003);
  }
  renderer.render(scene, camera);
  composer.render();
  }
  
}

animate();


